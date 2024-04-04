export const register = async (connection, database) => {
  const channel = await connection.createChannel()

  await channel.assertQueue(process.env.RABBITMQ_TARGET_IMAGE_CHANNEL, {
    durable: false
  })

  channel.consume(process.env.RABBITMQ_TARGET_IMAGE_CHANNEL, msg => {
    if (msg === null) {
      return
    }

    const { ownerId, uuid, targetId, imagePath } = JSON.parse(
      msg.content.toString()
    )

    database.saveImagePath(uuid, imagePath, targetId, ownerId)

    channel.ack(msg)
  })
}
