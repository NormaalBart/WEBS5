import express from 'express'
import { Database } from './util/database.js'
import { decodeBase64Image } from './util/file.js'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const app = express()
const port = process.env.PORT || 3000

app.use(express.json({ limit: '50mb' }))

const db = new Database()

app.post('/upload', async (req, res) => {
  if (!req.body.image) {
    return res.status(400).send('Geen afbeelding gevonden in de request.')
  }

  const fileName = uuidv4() + '.png'
  const filePath = path.join('images', fileName)

  decodeBase64Image(req.body.image, filePath)

  try {
    const imageId = await db.saveImagePath(filePath)
    res.json({ id: imageId })
  } catch (error) {
    console.error('Database error:', error)
    res
      .status(500)
      .send('Fout bij het opslaan van de afbeelding in de database.')
  }
})

app.get('/image/:id', async (req, res) => {
  const imageId = req.params.id

  try {
    const imagePath = await db.getImagePath(imageId)
    console.log('ID: ' + imageId)
    console.log('path: ' + imagePath)

    if (!imagePath) {
      return res.status(404).send('Afbeelding niet gevonden.')
    }

    res.send(imagePath)
    //res.sendFile(path.resolve(imagePath)) << Moet nog een custom coding in api gateway om foto te zien...
  } catch (error) {
    console.error('Error:', error)
    res.status(500).send('Interne serverfout.')
  }
})
app.listen(port, () => {
  console.log(`Server luistert op poort ${port}`)
})
