import { v4 as uuidv4 } from 'uuid'
import fs from 'fs/promises'
import path from 'path'
import multer from 'multer'

const storage = multer.memoryStorage()
const upload = multer({ storage })

export const register = (app, db, rabbitMq) => {
  app.post('/:targetId', upload.single('image'), async (req, res) => {
    const { targetId } = req.params
    const ownerId = req.headers.authdata.userId
    const file = req.file
    if (!file) {
      return res
        .status(400)
        .send({ error: 'Geen afbeelding gevonden in de request.' })
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
          url: 'TODO',
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
