import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export const register = (app, db) => {
  app.post('/login', async (req, res, next) => {
    const { mail, password } = req.body

    if (!mail || !password) {
      res.status(400).send({ error: 'Mail, Password zijn verplichte velden' })
      return
    }

    try {
      const user = await db.getUserByMail(mail.toLowerCase())

      if (!user) {
        res.status(401).send({ error: 'Gebruiker bestaat niet' })
        return
      }

      const isValid = await bcrypt.compare(password, user.password)

      if (!isValid) {
        res.status(401).send({ error: 'Fout wachtwoord' })
        return
      }

      const token = jwt.sign(
        { userId: user.id, username: user.username, mail: user.mail },
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
