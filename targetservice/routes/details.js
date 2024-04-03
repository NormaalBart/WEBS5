export const register = (app, db) => {
  app.get('/:id', async (req, res) => {
    const { id } = req.params

    try {
      const target = await db.getTargetById(id)
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
