import bcrypt from 'bcryptjs'

export const register = (app, db, rabbitMq) => {
  app.post('/register', async (req, res) => {
    const { username, mail, password } = req.body

    if (!username || !mail || !password) {
      res
        .status(400)
        .send({ error: 'Username, Mail, Password zijn verplichte velden' })
      return
    }

    const emailRegex = /(.+)@(.+){2,}\.(.+){2,}/
    if (!emailRegex.test(mail)) {
      res.status(400).send({ error: 'Ongeldig e-mailadres.' })
      return
    }

    try {
      if (await db.userExists(mail)) {
        res.status(409).send({ error: 'Gebruiker bestaat al' })
        return
      }

      const hashedPassword = await bcrypt.hash(password, 10)
      const id = await db.registerUser(
        username,
        mail.toLowerCase(),
        hashedPassword
      )
      res.status(201).send(id)
      rabbitMq.sendToQueue(process.env.RABBITMQ_MAIL_CHANNEL, {
        template: 'register',
        subject: 'Registratie bevestiging',
        mail,
        data: {
          username
        }
      })
    } catch (error) {
      console.error(error)
      res.status(500).send({ error: 'Interne serverfout' })
    }
  })
}
