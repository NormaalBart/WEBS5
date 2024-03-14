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
  const imageBase64 = req.file.buffer.toString('base64')

  req.body.image = imageBase64
  Breaker.post(url + 'upload', req, res)
})

router.get('/:id', (req, res, next) => {
  const imageId = req.params.id
  Breaker.get(url + 'image/' + imageId, req, res)
})

export default router
