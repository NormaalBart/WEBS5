import express from 'express'
import { Database } from './util/database.js'
import { loadRoutes } from './util/autoregister.js'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
const db = new Database()
const port = process.env.PORT || 3000

app.use(express.json())

loadRoutes(app, db)

app.listen(port, () => {
  console.log(`Server luistert op poort ${port}`)
})
