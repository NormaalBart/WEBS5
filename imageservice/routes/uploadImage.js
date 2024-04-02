import { v4 as uuidv4 } from 'uuid'
import fs from 'fs/promises'
import path from 'path'
import multer from 'multer'

const storage = multer.memoryStorage()
const upload = multer({ storage })

export const register = (app, db) => {
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
}
