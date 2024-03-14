import express from 'express'
import imageServiceRouter from './routes/imageservicerouter.js'

const app = express()
const port = process.env.PORT || 3000

app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.url}`)
  next()
})

app.use('/images', imageServiceRouter)

app.listen(port, () => {
  console.log(`API Gateway luistert op poort ${port}`)
})
