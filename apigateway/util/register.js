import CircuitBreaker from 'opossum'

export function createRouteWithCircuitBreaker (app, path, router) {
  // Default not 404 not found.
  router.use((req, res, next) => {
    res.status(404).send('Not Found')
    next()
  })

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
    breaker
      .fire(req, res)
      .then(res => {})
      .catch(error => {
        console.log(error)
        // TODO: Logging file?
        console.log('Er is iets fout gegaan!')
        if (!res.headersSent) {
          res.status(503).send('Service Unavailable')
        }
      })
  })
}
