import validator from 'validator'
import path from 'path'
import fs from 'fs'

export const register = (app, db) => {
  app.delete('/:target/:imageId', async (req, res) => {
    const { target, imageId } = req.params
    const ownerId = req.headers.authdata.userId

    if (!validator.isUUID(imageId)) {
      return res.status(400).send({
        error: 'Ongeldige id.'
      })
    }

    console.log(target)

    try {
      const { rowCount, ownerMatch, targetMatch } = await db.canDeleteImage(
        imageId,
        target,
        ownerId
      )
      if (rowCount === 0) {
        return res.status(404).send({ error: 'Afbeelding niet gevonden.' })
      }
      if (!targetMatch) {
        return res.status(403).send({ error: 'Target niet gevonden bij foto' })
      }
      if (!ownerMatch) {
        return res.status(403).send({
          error: 'Geen toestemming om deze afbeelding te verwijderen.'
        })
      }

      const imagePath = await db.deleteImage(imageId)
      const absolutePath = path.resolve(imagePath)
      fs.unlinkSync(absolutePath)
      res.status(200).send({ message: 'Afbeelding succesvol verwijderd.' })
    } catch (error) {
      console.error('Fout bij het verwijderen van de afbeelding:', error)
      res.status(500).send({ error: 'Interne serverfout' })
    }
  })
}
