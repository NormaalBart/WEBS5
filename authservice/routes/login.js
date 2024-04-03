import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export const register = (app, db) => {
  app.post('/login', async (req, res, next) => {
    const { username, password } = req.body

    if (!username || !password) {
      res.status(400).send({ error: 'Username, Password zijn verplichte velden' })
    }

    try {
      const user = await db.getUserByUsername(username)

      if (!user) {
        res.status(401).send({ error: 'Gebruiker bestaat niet' })
      }

      const isValid = await bcrypt.compare(password, user.password)

      if (!isValid) {
        res.status(401).send({ error: 'Fout wachtwoord' })
      }

      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '2400h' }
      )

      res.json({ token })
    } catch (error) {
      console.error(error)
      res.status(500).send({ error: 'Interne serverfout' })
    }
  })
}
