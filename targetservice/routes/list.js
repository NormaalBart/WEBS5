export const register = (app, db) => {
  app.get('/', async (req, res) => {
    try {
      if (req.headers.authdata.role !== 'admin') {
        return res
          .status(403)
          .send({ error: 'Geen toestemming om dit in te zien.' })
      }
      const targets = await db.getTargets()
      res.status(200).send(targets)
    } catch (error) {
      console.error('Fout bij het ophalen van targets:', error)
      res.status(500).send({ error: 'Interne serverfout' })
    }
  })
}
