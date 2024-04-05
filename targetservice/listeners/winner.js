export const register = async (connection, database) => {
  const channel = await connection.createChannel()

  await channel.assertQueue(process.env.RABBITMQ_ANNOUNCE_WINNAR_CHANNEL, {
    durable: false
  })

  channel.consume(process.env.RABBITMQ_ANNOUNCE_WINNAR_CHANNEL, msg => {
    if (msg === null) {
      return
    }

    const { targetId, winner } = JSON.parse(msg.content.toString())
    database.updateTarget(targetId, winner)
    channel.ack(msg)
  })
}
