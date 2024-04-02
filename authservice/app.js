import express from 'express'
import { Database } from './util/database.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
const app = express()
const db = new Database()

app.use(express.json()) // Voor het parsen van JSON request bodies

app.post('/register', async (req, res) => {
  if (!req.body.username || req.body.password) {
    return res.status(400).send('Mist parameters')
  }
  const { username, password } = req.body
  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    await db.query('INSERT INTO users(username, password) VALUES($1, $2)', [
      username,
      hashedPassword
    ])
    res.status(201).send('Gebruiker succesvol geregistreerd')
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .send('Er is iets misgegaan bij het registreren van de gebruiker')
  }
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body

  try {
    const { rows } = await db.query('SELECT * FROM users WHERE username = $1', [
      username
    ])
    if (rows.length > 0) {
      const user = rows[0]
      const match = await bcrypt.compare(password, user.password)
      if (match) {
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
          expiresIn: '1h'
        })
        res.json({ token })
      } else {
        res.status(401).send('Wachtwoord is incorrect')
      }
    } else {
      res.status(404).send('Gebruiker niet gevonden')
    }
  } catch (error) {
    console.error(error)
    res.status(500).send('Login fout')
  }
})

const port = 3000
app.listen(port, () => {
  console.log(`Server luistert op poort ${port}`)
})
