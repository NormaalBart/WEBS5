import express from 'express'
import { Database } from './util/database.js'
import { RabbitMQUtil } from './util/rabbitmq.js'
import { loadRoutes } from './util/autoregister.js'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
const db = new Database()
const rabbitMq = new RabbitMQUtil(db)
const port = process.env.PORT || 3000

app.use(express.json())

loadRoutes(app, db, rabbitMq)

app.listen(port, () => {
  console.log(`Server luistert op poort ${port}`)
})
