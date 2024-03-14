import express from 'express'
import multer from 'multer'
import Breaker from '../util/breaker.js'

const url = process.env.IMAGE_SERVICE || 'http://localhost:3000/'
const upload = multer({ storage: multer.memoryStorage() })
const router = express.Router()

router.post('/', upload.single('image'), (req, res, next) => {
  if (!req.file) {
    return res.status(400).send('Geen bestand geüpload.')
  }
  // Converteer het geüploade bestand naar Base64
  const imageBase64 = req.file.buffer.toString('base64')

  req.body.image = imageBase64
  Breaker.post(url + 'upload', req, res)
})

export default router
