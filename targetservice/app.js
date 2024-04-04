import express from 'express'
import { Database } from './util/database.js'
import { loadRoutes } from './util/autoregister.js'
import { RabbitMQUtil } from './util/rabbitmq.js'

const app = express()
const db = new Database()
const rabbitMq = new RabbitMQUtil(db)

const port = process.env.PORT || 3000

app.use(express.json())

app.use((req, res, next) => {
  req.headers.authdata = JSON.parse(req.headers.authdata)
  next()
})

loadRoutes(app, db, rabbitMq)

app.listen(port, () => {
  console.log(`Server luistert op poort ${port}`)
})
