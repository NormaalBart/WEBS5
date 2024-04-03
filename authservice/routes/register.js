import bcrypt from 'bcryptjs'

export const register = (app, db) => {
  app.post('/register', async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
      res
        .status(400)
        .send({ error: 'Username, Password zijn verplichte velden' })
      return
    }

    try {
      if (await db.userExists(username)) {
        res.status(409).send({ error: 'Gebruiker bestaat al' })
        return
      }

      const hashedPassword = await bcrypt.hash(password, 10)
      const id = await db.registerUser(username, hashedPassword)

      res.status(201).send(id)
    } catch (error) {
      console.error(error)
      res.status(500).send({ error: 'Interne serverfout' })
    }
  })
}
