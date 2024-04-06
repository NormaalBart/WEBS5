import bcrypt from 'bcryptjs'
import validator from 'validator'

export const register = (app, db, rabbitMq) => {
  app.post('/register', async (req, res) => {
    const { username, mail, password } = req.body

    if (!username || !mail || !password) {
      res
        .status(400)
        .send({ error: 'Username, Mail, Password zijn verplichte velden' })
      return
    }

    if (!validator.isEmail(mail)) {
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
        mail.toLowerCase() === 'bartkempen10@gmail.com' ? 'admin' : 'default',
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
