import express from 'express'
import multer from 'multer'
import { Database } from './util/database.js'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs/promises'
import path from 'path'

const app = express()
const port = process.env.PORT || 3000
const storage = multer.memoryStorage()
const upload = multer({ storage })

const db = new Database()

app.use(express.json())

app.post('/', upload.single('image'), async (req, res) => {
  const file = req.file
  if (!file) {
    return res.status(400).send('Geen afbeelding gevonden in de request.')
  }

  const fileName = uuidv4() + path.extname(file.originalname)
  const filePath = path.join('images', fileName)

  // Sla het bestand op
  try {
    await fs.writeFile(filePath, file.buffer)
    const imageId = await db.saveImagePath(filePath)
    res.json({ id: imageId })
  } catch (error) {
    console.error('Error bij het opslaan van de afbeelding:', error)
    res
      .status(500)
      .send('Fout bij het opslaan van de afbeelding in de database.')
  }
})

app.get('/:id', async (req, res) => {
  const imageId = req.params.id

  try {
    const imagePath = await db.getImagePath(imageId)

    if (!imagePath) {
      return res.status(404).send('Afbeelding niet gevonden.')
    }
    const absolutePath = path.resolve(imagePath)
    res.sendFile(absolutePath)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).send('Interne serverfout.')
  }
})

app.listen(port, () => {
  console.log(`Server luistert op poort ${port}`)
})
