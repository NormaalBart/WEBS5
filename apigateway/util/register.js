import CircuitBreaker from 'opossum'

export function createRouteWithCircuitBreaker (app, path, router) {
  const breaker = new CircuitBreaker(
    (req, res) =>
      new Promise((resolve, reject) => {
        const fakeNext = err => (err ? reject(err) : resolve())
        router(req, res, fakeNext)
      }),
    {
      timeout: 500,
      errorThresholdPercentage: 50,
      resetTimeout: 5000
    }
  )

  app.use(path, (req, res) => {
    breaker.fire(req, res).catch(error => {
      // TODO: Logging file?
      console.error(error)
      if (!res.headersSent) {
        res.status(503).send('Service Unavailable')
      }
    })
  })
}
