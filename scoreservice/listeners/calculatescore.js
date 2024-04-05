import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'

export const register = async (connection, database, rabbitMq) => {
  const channel = await connection.createChannel()

  await channel.assertQueue(process.env.RABBITMQ_SCORE_CHANNEL, {
    durable: false
  })

  channel.consume(process.env.RABBITMQ_SCORE_CHANNEL, async msg => {
    if (msg === null) {
      return
    }

    const json = JSON.parse(msg.content.toString())
    console.log(json)
    if (json.type === 'score') {
      const { targetId, ownerId, uuid, filePath, originalFile } = json.data
      scoreImage(database, targetId, ownerId, uuid, filePath, originalFile)
    } else if (json.type === 'finish') {
      finishTarget(rabbitMq, database, json.data.targetId)
    } else {
      console.log(`unknown scoring type ${json.type}`)
      return
    }
    channel.ack(msg)
  })
}

async function finishTarget (rabbitMq, database, targetId) {
  const scores = await database.getScoresOrderByScore(targetId)
  let winner = true
  for (const key in scores) {
    const imageScore = scores[key]
    rabbitMq.sendToQueue(process.env.RABBITMQ_MAIL_CHANNEL, {
      template: 'result-' + winner,
      subject: 'Resultaat target ' + targetId,
      ownerId: imageScore.owner_id,
      data: {
        winner,
        score: imageScore.score,
        target: targetId
      }
    })
    winner = false
  }
}

function scoreImage (database, targetId, ownerId, uuid, filePath, originalFile) {
  const form = new FormData()
  form.append('image', fs.createReadStream(filePath))

  const auth = {
    username: process.env.IMAGGA_USERNAME,
    password: process.env.IMAGGA_PASSWORD
  }

  axios
    .post('https://api.imagga.com/v2/tags', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Basic ${Buffer.from(
          `${auth.username}:${auth.password}`
        ).toString('base64')}`
      }
    })
    .then(async response => {
      const jsonResponse = JSON.parse(JSON.stringify(response.data))
      if (!(await database.getTarget(targetId))) {
        return
      }
      if (originalFile) {
        database.createScore(
          targetId,
          ownerId,
          uuid,
          JSON.stringify(jsonResponse.result.tags)
        )
      } else {
        const originalScore = await database.getOriginalScore(targetId)
        const tags = JSON.parse(JSON.stringify(originalScore))
        const confidenceScore = calculateTagsConfidenceScore(
          tags,
          jsonResponse.result.tags
        )
        database.insertImageResult(targetId, uuid, ownerId, confidenceScore)
      }
    })
    .catch(error => {
      console.error('Er is een fout opgetreden:', error)
    })
}

function calculateTagsConfidenceScore (tagsA, tagsB) {
  const mapA = new Map(
    tagsA.map(tag => [tag.tag.en.toLowerCase(), tag.confidence])
  )
  const mapB = new Map(
    tagsB.map(tag => [tag.tag.en.toLowerCase(), tag.confidence])
  )

  let matchCount = 0
  let confidenceDifferenceSum = 0
  for (const [tag, confidenceA] of mapA) {
    if (mapB.has(tag)) {
      matchCount++
      const confidenceB = mapB.get(tag)
      confidenceDifferenceSum += Math.abs(confidenceA - confidenceB)
    }
  }

  const averageConfidenceDifference =
    matchCount > 0 ? confidenceDifferenceSum / matchCount : 0
  const matchPercentage =
    (matchCount / Math.min(tagsA.length, tagsB.length)) * 100
  const confidenceScore = 100 - averageConfidenceDifference

  const finalScore = matchPercentage * 0.7 + confidenceScore * 0.3

  return finalScore.toFixed(2)
}
