export const checkAndExecuteTargets = async (db, rabbitMq) => {
  const targets = await db.getTargets()

  targets.forEach(target => {
    const now = new Date()

    if (target.end_time < now) {
      executeAction(target, db, rabbitMq)
    } else {
      scheduleAction(target, target.end_time, db, rabbitMq)
    }
  })
}

export const executeAction = async (target, database, rabbitMq) => {
  if (!(await database.getTarget(target.id))) {
    return
  }
  rabbitMq.sendToQueue(process.env.RABBITMQ_SCORE_CHANNEL, {
    type: 'finish',
    data: {
      targetId: target.id
    }
  })
  console.log(`Actie uitgevoerd voor target: ${target.id}`)

  database.deleteTarget(target.id)
}

export const scheduleAction = (target, endTime, db, rabbitMq) => {
  console.log(endTime)
  const delay = new Date(endTime).getTime() - new Date().getTime()
  setTimeout(() => executeAction(target, db, rabbitMq), delay)
  console.log(
    `Actie gepland voor target: ${target.id} over ${delay} milliseconden`
  )
}
