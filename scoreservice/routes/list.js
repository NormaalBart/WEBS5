export const register = (app, db) => {
  app.get('/:targetId', async (req, res) => {
    const { targetId } = req.params
    const ownerId = req.headers.authdata.userId

    try {
      const scores = await db.getImageResultsByTargetId(targetId, ownerId)
      if (!scores.isOwner) {
        return res
          .status(403)
          .send({ error: 'Geen toestemming om deze target te in te zien.' })
      }
      if (scores.data) {
        res.status(200).send(scores.data)
      } else {
        res.status(404).send({ error: 'Niet gevonden.' })
      }
    } catch (error) {
      console.error('Fout bij het ophalen van de score details:', error)
      res.status(500).send({ error: 'Interne serverfout' })
    }
  })
}
