export const register = async (connection, database) => {
  const channel = await connection.createChannel()

  await channel.assertExchange(process.env.RABBITMQ_DELETE_CHANNEL, 'fanout', {
    durable: false
  })

  const q = await channel.assertQueue('', { exclusive: true })

  // Bind de queue aan de exchange
  await channel.bindQueue(q.queue, process.env.RABBITMQ_DELETE_CHANNEL, '')

  // Consume berichten van de queue
  channel.consume(
    q.queue,
    msg => {
      if (msg.content) {
        const json = JSON.parse(msg.content.toString())
        if (json.type === 'target') {
          database.deleteTarget(json.id)
          database.deleteImages(json.id)
        }
      }
    },
    { noAck: true }
  )
}
