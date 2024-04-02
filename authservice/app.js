import express from 'express'
import { Database } from './util/database.js'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
dotenv.config()

const app = express()
const db = new Database()
const port = process.env.PORT || 3000

app.use(express.json())

app.post('/register', async (req, res) => {
  const { username, password } = req.body
  console.log(req.body)
  if (!username || !password) {
    return res.status(400).send('Mist parameters')
  }

  try {
    // Controleer of de gebruikersnaam al bestaat
    const userExists = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    )
    if (userExists.rows.length > 0) {
      return res.status(409).send('Gebruikersnaam bestaat al')
    }

    // Hash het wachtwoord
    const hashedPassword = await bcrypt.hash(password, 10)

    // Voeg de nieuwe gebruiker toe aan de database
    await db.query('INSERT INTO users (username, password) VALUES ($1, $2)', [
      username,
      hashedPassword
    ])
    res.status(201).send('Gebruiker succesvol geregistreerd')
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .send('Er is een fout opgetreden bij het registreren van de gebruiker')
  }
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).send('Mist parameters')
  }

  try {
    const { rows } = await db.query('SELECT * FROM users WHERE username = $1', [
      username
    ])
    if (rows.length === 0) {
      return res.status(401).send('Gebruiker bestaat niet')
    }

    const user = rows[0]
    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return res.status(401).send('Onjuist wachtwoord')
    }

    // Gebruiker is geauthenticeerd, genereer en verstuur de JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({ token })
  } catch (error) {
    console.error(error)
    res.status(500).send('Serverfout bij het inloggen')
  }
})
app.listen(port, () => {
  console.log(`Server luistert op poort ${port}`)
})
