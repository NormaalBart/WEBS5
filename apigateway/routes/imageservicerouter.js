import express from 'express'
import axios from 'axios'

const url = process.env.IMAGE_SERVICE || 'http://localhost:3000/'

const router = express.Router()

router.post('/', async (req, res, next) => {
  axios
    .post(url + 'upload', req)
    .then(response => {
      res.send(response)
      next()
    })
    .catch(e => {
      next(e)
    })
})

export default router
