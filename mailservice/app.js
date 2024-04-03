import amqp from 'amqplib'

async function startConsumer () {
  console.log(process.env.RABBITMQ)
  const connection = await amqp.connect(process.env.RABBITMQ_URL)
  const channel = await connection.createChannel()
  const queue = process.env.RABBITMQ_MAIL_CHANNEL

  await channel.assertQueue(queue, { durable: false })
  console.log('Wachten op berichten in %s.', queue)

  channel.consume(queue, async msg => {
    if (msg !== null) {
      console.log('Ontvangen mail!')
      const { template, mail, data } = JSON.parse(msg.content.toString())

      console.log('  Template: ' + template)
      console.log('  Mail: ' + mail)
      console.log('  Data: ' + data)

      // Verstuur de mail
      //await sendMail(template, email, data)

      channel.ack(msg)
    }
  })
}

startConsumer().catch(console.warn)
