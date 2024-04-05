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
  const connection = await amqp.connect(process.env.RABBITMQ_URL)
  const channel = await connection.createChannel()
  const queue = process.env.RABBITMQ_MAIL_CHANNEL

  await channel.assertQueue(queue, { durable: false })
  await channel.assertQueue(
    process.env.RABBITMQ_USER_REQUEST_RESPONSE_CHANNEL,
    { durable: false }
  )

  const processMessage = async msg => {
    if (msg !== null) {
      const json = JSON.parse(msg.content.toString())

      console.log(json)

      if (json.ownerId) {
        sendUserRequest(channel, json)
      } else if (json.user) {
        console.log('processing...')
        await processEmail({
          template: json.data.template,
          subject: json.data.subject,
          mail: json.user.mail,
          data: {
            ...json.data.data,
            name: json.user.username
          }
        })
      } else {
        await processEmail(json)
      }

      channel.ack(msg)
    }
  }

  console.log(`Wachten op berichten in ${queue}.`)
  channel.consume(queue, processMessage)

  console.log(
    `Wachten op berichten in ${process.env.RABBITMQ_USER_REQUEST_RESPONSE_CHANNEL}.`
  )
  channel.consume(
    process.env.RABBITMQ_USER_REQUEST_RESPONSE_CHANNEL,
    processMessage
  )
}

async function sendUserRequest (channel, data) {
  await channel.assertQueue(process.env.RABBITMQ_USER_REQUEST_CHANNEL, {
    durable: false
  })
  channel.sendToQueue(
    process.env.RABBITMQ_USER_REQUEST_CHANNEL,
    Buffer.from(JSON.stringify(data))
  )
  console.log('Requesting user info...')
}

async function processEmail ({ template, subject, mail, data }) {
  const emailContent = await loadAndParseTemplate(template, data)

  if (emailContent) {
    console.log(`${mail} verstuurd met template ${template}`)
    await sendMail(mail, subject, emailContent)
  } else {
    console.error(`E-mail niet verstuurd. Template ${template} bestaat niet.`)
  }
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

  try {
    let templateContent = await fs.promises.readFile(templatePath, 'utf-8')
    for (const key of Object.keys(data)) {
      const regex = new RegExp(`\\$\{${key}}`, 'g')
      templateContent = templateContent.replace(regex, data[key])
    }
    return templateContent
  } catch (error) {
    console.error(`Template ${templateName} niet gevonden.`, error)
    return null
  }
}

startConsumer().catch(console.warn)
