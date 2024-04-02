import bcrypt from 'bcryptjs'

export const register = (app, db) => {
  app.post('/register', async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).send('Mist parameters')
    }

    try {
      if (await db.userExists(username)) {
        return res.status(409).send('Gebruikersnaam bestaat al')
      }

      const hashedPassword = await bcrypt.hash(password, 10)
      const user = await db.registerUser(username, hashedPassword)

      res.status(201).send(`Gebruiker ${user.username} succesvol geregistreerd`)
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .send('Er is een fout opgetreden bij het registreren van de gebruiker')
    }
  })
}
