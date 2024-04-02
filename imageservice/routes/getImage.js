import path from 'path'

export const register = (app, db) => {
  app.get('/:id', async (req, res) => {
    const imageId = req.params.id

    try {
      const imagePath = await db.getImagePath(imageId)

      if (!imagePath) {
        return res.status(404).send('Afbeelding niet gevonden.')
      }
      const absolutePath = path.resolve(imagePath)
      res.sendFile(absolutePath)
    } catch (error) {
      res.status(500).send('Interne serverfout.')
    }
  })
}
