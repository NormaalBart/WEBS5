import express from 'express'
import axios from 'axios'

const url = process.env.IMAGE_SERVICE || 'https://123:3000/'
const router = express.Router()

// Definieer user gerelateerde routes hier
router.get('/', async (req, res, next) => {
  res.send('Image GET request 213')
  next()
})

router.post('/', async (req, res, next) => {
  axios
    .post(url + 'upload', req)
    .then(response => {
      res.write(response)
      next()
    })
    .catch(e => {
      next(e)
    })
})

export default router
