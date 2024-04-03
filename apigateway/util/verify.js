import fetch from 'node-fetch'

export const verify = async (req, res, next) => {
  const bearerHeader = req.headers.authorization

  if (typeof bearerHeader !== 'undefined') {
    try {
      const verifyResponse = await fetch(`${process.env.AUTH_SERVICE}verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: bearerHeader
        }
      })


      if (verifyResponse.ok) {
        const authData = await verifyResponse.json()
        req.headers.authdata = JSON.stringify(authData.data)
        next()
      } else {
        res.status(403).send({ error: 'Forbidden' })
      }
    } catch (error) {
      console.error('Error bij verificatie van token:', error)
      res.status(500).send({ error: 'Interne serverfout' })
    }
  } else {
    res.status(403).send({ error: 'Forbidden' })
  }
}
