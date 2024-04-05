export const register = async (connection, database, rabbitMq) => {
  const channel = await connection.createChannel()

  await channel.assertQueue(process.env.RABBITMQ_USER_REQUEST_CHANNEL, {
    durable: false
  })

  channel.consume(process.env.RABBITMQ_USER_REQUEST_CHANNEL, async msg => {
    if (msg === null) {
      return
    }

    const json = JSON.parse(msg.content.toString())
    console.log('json: ')
    console.log(json)

    const user = await database.getUserById(json.ownerId)
    const data = { user, data: json }
    console.log('returning: ')
    console.log(data)

    rabbitMq.sendToQueue(
      process.env.RABBITMQ_USER_REQUEST_RESPONSE_CHANNEL,
      data
    )

    channel.ack(msg)
  })
}
