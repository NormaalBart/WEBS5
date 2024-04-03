export const register = (app, db) => {
  app.delete('/:id', async (req, res) => {
    const { id } = req.params

    // Probeer de target te verwijderen en stuur een respons
    try {
      const rowCount = await db.deleteTarget(id)
      if (rowCount > 0) {
        res.status(200).send({ message: 'Target succesvol verwijderd.' })
      } else {
        // Geen target gevonden met het opgegeven ID
        res.status(404).send({ error: 'Target niet gevonden.' })
      }
    } catch (error) {
      console.error('Fout bij het verwijderen van de target:', error)
      res.status(500).send({ error: 'Interne serverfout' })
    }
  })
}
