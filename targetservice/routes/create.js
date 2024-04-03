export const register = (app, db) => {
  app.post('/', async (req, res) => {
    const { name, longitude, latitude, endTime } = req.body
    const ownerId = req.headers.authdata.userId

    if (
      !name ||
      longitude === undefined ||
      latitude === undefined ||
      endTime === undefined
    ) {
      return res.status(400).send({
        error:
          'Missende velden: naam, longitude, latitude, eindtijd zijn verplicht.'
      })
    }

    const endTimeDate = new Date(parseInt(endTime, 10))
    if (isNaN(endTimeDate.getTime())) {
      return res.status(400).send({
        error:
          'Ongeldige eindtijd formaat. Zorg ervoor dat de eindtijd in milliseconden sinds de Unix Epoch is.'
      })
    }

    if (endTimeDate.getTime() <= Date.now()) {
      return res
        .status(400)
        .send({ error: 'De eindtijd moet in de toekomst liggen.' })
    }

    try {
      const id = await db.createTarget(name, longitude, latitude, ownerId, endTimeDate)
      res.status(201).send({ id })
    } catch (error) {
      console.error('Fout bij het aanmaken van de target:', error)
      res.status(500).send({ error: 'Interne serverfout' })
    }
  })
}
