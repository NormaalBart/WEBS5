export const register = async (connection, database) => {
  const channel = await connection.createChannel()

  await channel.assertQueue(process.env.RABBITMQ_SCORE_CHANNEL, {
    durable: false
  })

  channel.consume(process.env.RABBITMQ_SCORE_CHANNEL, msg => {
    if (msg === null) {
      return
    }

    console.log(msg.content.toString())

    channel.ack(msg)
  })
}
