import { v4 as uuidv4 } from 'uuid'
import fs from 'fs/promises'
import path from 'path'
import multer from 'multer'

const storage = multer.memoryStorage()
const upload = multer({ storage })

export const register = (app, db, rabbitMq) => {
  app.post('/:targetId', upload.single('image'), async (req, res) => {
    const { targetId } = req.params
    const { latitude, longitude } = req.body

    const ownerId = req.headers.authdata.userId
    const file = req.file
    if (!file || latitude === undefined || longitude === undefined) {
      return res
        .status(400)
        .send({ error: 'image, latitude, longitude zijn verplicht.' })
    }

    const target = await db.getTarget(targetId)

    if (!target) {
      return res.status(400).send({ error: 'Target bestaat niet.' })
    }

    const endTime = new Date(target.end_time)
    const now = new Date()

    if (endTime <= now) {
      return res
        .status(410)
        .send({ error: 'De tijd voor dit target is verstreken.' })
    }

    if (
      !isWithinDistance(
        target.latitude,
        target.longitude,
        latitude,
        longitude,
        20
      )
    ) {
      return res.status(400).send({ error: 'Afstand ongeldig, binnen 20km.' })
    }

    const uuid = uuidv4()
    const fileName = uuid + path.extname(file.originalname)
    const filePath = path.join('images', fileName)

    try {
      await fs.writeFile(filePath, file.buffer)
      const imageId = await db.saveImagePath(uuid, filePath, targetId, ownerId)
      res.json({ id: imageId })
      rabbitMq.sendToQueue(process.env.RABBITMQ_MAIL_CHANNEL, {
        template: 'photo-received',
        subject: 'Ontvangstbewijs',
        mail: req.headers.authdata.mail,
        data: {
          name: req.headers.authdata.username,
          url:
            'http://localhost:3000/targets/' +
            targetId +
            '/images/' +
            uuid +
            '/scores',
          target: targetId
        }
      })
      rabbitMq.sendToQueue(process.env.RABBITMQ_SCORE_CHANNEL, {
        type: 'score',
        data: {
          targetId,
          ownerId,
          uuid,
          filePath,
          originalFile: false
        }
      })
    } catch (error) {
      console.error('Error bij het opslaan van de afbeelding:', error)
      res.status(500).send({ error: 'Fout bij opslaan van afbeelding' })
    }
  })
}

function isWithinDistance (lat1, lon1, lat2, lon2, maxDistance) {
  // Radius van de aarde in kilometers
  const R = 6371

  const dLat = degreesToRadians(lat2 - lat1)
  const dLon = degreesToRadians(lon2 - lon1)
  const rLat1 = degreesToRadians(lat1)
  const rLat2 = degreesToRadians(lat2)

  // Haversine formule
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(rLat1) * Math.cos(rLat2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return distance <= maxDistance
}

function degreesToRadians (degrees) {
  return degrees * (Math.PI / 180)
}
