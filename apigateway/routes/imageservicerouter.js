import express from 'express'
import Breaker from '../util/breaker.js'

const url = process.env.IMAGE_SERVICE || 'http://localhost:3000/'

const router = express.Router()

router.post('/', async (req, res, next) => {
  Breaker.post(url + 'upload', req, res, req.body)
})

export default router
