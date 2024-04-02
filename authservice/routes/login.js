import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export const register = (app, db) => {
  app.post('/login', async (req, res, next) => {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).send('Mist parameters')
    }

    try {
      const user = await db.getUserByUsername(username)

      if (!user) {
        return res.status(401).send('Gebruiker bestaat niet')
      }

      const isValid = await bcrypt.compare(password, user.password)

      if (!isValid) {
        return res.status(401).send('Onjuist wachtwoord')
      }

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
}
