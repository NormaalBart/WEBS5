import amqp from 'amqplib'
import nodemailer from 'nodemailer'
import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOG,
  port: 1025,
  auth: null
})

async function startConsumer () {
  console.log(process.env.RABBITMQ)
  const connection = await amqp.connect(process.env.RABBITMQ_URL)
  const channel = await connection.createChannel()
  const queue = process.env.RABBITMQ_MAIL_CHANNEL

  await channel.assertQueue(queue, { durable: false })
  console.log('Wachten op berichten in %s.', queue)

  channel.consume(queue, async msg => {
    if (msg !== null) {
      const { template, subject, mail, data } = JSON.parse(msg.content.toString())
      const emailContent = await loadAndParseTemplate(template, data)

      console.log(emailContent)
      if (emailContent) {
        await sendMail(mail, subject, emailContent)
      } else {
        console.error('E-mail niet verstuurd. Template bestaat niet.')
      }

      channel.ack(msg)
    }
  })
}

async function sendMail (to, subject, htmlContent) {
  try {
    await transporter.sendMail({
      from: '"Photo Prestige" <no-reply@photoprestige.com>',
      to,
      subject,
      html: htmlContent
    })

    console.log('E-mail succesvol verstuurd naar:', to)
  } catch (error) {
    console.error('Fout bij het versturen van de e-mail:', error)
  }
}

async function loadAndParseTemplate (templateName, data) {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const templatePath = path.join(__dirname, 'templates', `${templateName}.html`)

  console.log(templatePath)

  try {
    let templateContent = await fs.promises.readFile(templatePath, 'utf-8')

    for (const key of Object.keys(data)) {
      const regex = new RegExp(`\\$\{${key}}`, 'g')
      templateContent = templateContent.replace(regex, data[key])
    }

    return templateContent
  } catch (error) {
    console.log(error)
    console.error(`Template ${templateName} niet gevonden.`)
    return null
  }
}

startConsumer().catch(console.warn)
