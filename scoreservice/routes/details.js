export const register = (app, db) => {
  app.get('/:targetId/:imageId', async (req, res) => {
    const { targetId, imageId } = req.params

    try {
      const score = await db.getImageResultByTargetId(imageId, targetId)
      if (score) {
        res.status(200).send(score)
      } else {
        res.status(404).send({ error: 'Niet gevonden.' })
      }
    } catch (error) {
      console.error('Fout bij het ophalen van de score details:', error)
      res.status(500).send({ error: 'Interne serverfout' })
    }
  })
}
