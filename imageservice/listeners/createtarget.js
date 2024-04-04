export const register = async (connection, database) => {
  const channel = await connection.createChannel()

  await channel.assertExchange(process.env.RABBITMQ_CREATE_CHANNEL, 'fanout', {
    durable: false
  })

  const q = await channel.assertQueue('', { exclusive: true })

  // Bind de queue aan de exchange
  await channel.bindQueue(q.queue, process.env.RABBITMQ_CREATE_CHANNEL, '')

  // Consume berichten van de queue
  channel.consume(
    q.queue,
    msg => {
      if (msg.content) {
        const json = JSON.parse(msg.content.toString())
        console.log(json)
        if (json.type === 'target') {
          database.createTarget(
            json.id,
            json.endTimeDate,
            json.longitude,
            json.latitude
          )
        }
      }
    },
    { noAck: true }
  )
}
