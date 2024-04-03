import path from 'path'
import validator from 'validator'

export const register = (app, db) => {
  app.get('/:target/:imageId', async (req, res) => {
    const { target, imageId } = req.params

    if (!validator.isUUID(imageId)) {
      return res.status(400).send({
        error: 'Ongeldige id.'
      })
    }

    try {
      const imagePath = await db.getImagePath(imageId, target)

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
