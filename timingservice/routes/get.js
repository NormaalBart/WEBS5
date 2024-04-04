export const register = (app, db) => {
  app.get('/:targetId', async (req, res) => {
    const { targetId } = req.params

    try {
      const target = await db.getTarget(id)
      if (target) {
        res.status(200).send(target)
      } else {
        res.status(404).send({ error: 'Target niet gevonden.' })
      }
    } catch (error) {
      console.error('Fout bij het ophalen van de target details:', error)
      res.status(500).send({ error: 'Interne serverfout' })
    }
  })
}
