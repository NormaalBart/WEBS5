import amqp from 'amqplib'

export class RabbitMQUtil {
  constructor () {
    this.connection = null
    this.channel = null
    this.init()
  }

  async init (rabbitUrl) {
    this.connection = await amqp.connect(process.env.RABBITMQ_URL)
    this.channel = await this.connection.createChannel()
    console.log('RabbitMQ connection and channel initialized')
  }

  async sendToQueue (channel, data) {
    await this.channel.assertQueue(channel, { durable: false })
    this.channel.sendToQueue(channel, Buffer.from(JSON.stringify(data)))
  }
}
