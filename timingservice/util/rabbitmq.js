import amqp from 'amqplib'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

export class RabbitMQUtil {
  constructor (database) {
    this.connection = null
    this.channel = null
    this.init(database)
  }

  async init (database) {
    this.connection = await amqp.connect(process.env.RABBITMQ_URL)
    this.channel = await this.connection.createChannel()
    this.loadListeners(database)
    console.log('RabbitMQ connection and channel initialized')
  }

  async sendToQueue (channel, data) {
    await this.channel.assertQueue(channel, { durable: false })
    this.channel.sendToQueue(channel, Buffer.from(JSON.stringify(data)))
  }

  async loadListeners (database) {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    const routesPath = path.join(__dirname, '../listeners')
    const files = fs.readdirSync(routesPath)

    const imports = files
      .filter(file => file.endsWith('.js'))
      .map(async file => {
        const route = await import(`../listeners/${file}`)
        route.register(this.connection, database, this)
      })

    await Promise.all(imports)
  }
}
