export const register = (app, db) => {
  app.delete('/:id', async (req, res) => {
    const { id } = req.params
    const ownerId = req.headers.authdata.userId

    try {
      const { rowCount, ownerMatch } = await db.deleteTarget(id, ownerId)
      if (rowCount === 0) {
        return res.status(404).send({ error: 'Target niet gevonden.' })
      }
      if (!ownerMatch) {
        return res
          .status(403)
          .send({ error: 'Geen toestemming om deze target te verwijderen.' })
      }
      res.status(200).send({ message: 'Target succesvol verwijderd.' })
    } catch (error) {
      console.error('Fout bij het verwijderen van de target:', error)
      res.status(500).send({ error: 'Interne serverfout' })
    }
  })
}
