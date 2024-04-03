import jwt from 'jsonwebtoken'

export const register = (app, db) => {
  app.post('/verify', async (req, res) => {
    const bearerHeader = req.headers.authorization
    console.log('called')
    if (typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(' ')
      const bearerToken = bearer[1]
      jwt.verify(bearerToken, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
          res.status(403).send({ error: 'Forbidden' })
        } else {
          res.status(200).send({ data: authData })
        }
      })
    } else {
      res.status(403).send({ error: 'Forbidden' })
    }
  })
}
