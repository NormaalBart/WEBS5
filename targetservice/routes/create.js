import multer from 'multer'
import fs from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'

const storage = multer.memoryStorage()
const upload = multer({ storage })

export const register = (app, db, rabbitMq) => {
  app.post('/', upload.single('image'), async (req, res) => {
    const { name, longitude, latitude, endTime } = req.body
    const ownerId = req.headers.authdata.userId
    const file = req.file

    if (
      !name ||
      longitude === undefined ||
      latitude === undefined ||
      endTime === undefined ||
      !file
    ) {
      return res.status(400).send({
        error:
          'Missende velden: naam, longitude, latitude, eindtijd, image zijn verplicht.'
      })
    }

    const endTimeDate = new Date(parseInt(endTime, 10))
    if (isNaN(endTimeDate.getTime())) {
      return res.status(400).send({
        error:
          'Ongeldige eindtijd formaat. Zorg ervoor dat de eindtijd in milliseconden sinds de Unix Epoch is.'
      })
    }

    if (endTimeDate.getTime() <= Date.now()) {
      return res
        .status(400)
        .send({ error: 'De eindtijd moet in de toekomst liggen.' })
    }

    try {
      const uuid = uuidv4()
      const fileName = uuid + path.extname(file.originalname)
      const filePath = path.join('images', fileName)
      await fs.writeFile(filePath, file.buffer)

      const id = await db.createTarget(
        name,
        longitude,
        latitude,
        ownerId,
        endTimeDate,
        uuid
      )
      res.status(201).send({ id })

      rabbitMq.sendToQueue(process.env.RABBITMQ_TARGET_IMAGE_CHANNEL, {
        ownerId,
        uuid,
        targetId: id,
        imagePath: filePath
      })
      rabbitMq.sendToQueue(process.env.RABBITMQ_SCORE_CHANNEL, {
        targetId: id,
        ownerId,
        uuid,
        filePath,
        originalFile: true
      })
    } catch (error) {
      console.error('Fout bij het aanmaken van de target:', error)
      res.status(500).send({ error: 'Interne serverfout' })
    }
  })
}
