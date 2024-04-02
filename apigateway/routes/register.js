import proxy from 'express-http-proxy'
import CircuitBreaker from 'opossum'

const SERVICES = {
  '/images': process.env.IMAGE_SERVICE,
  '/auth': process.env.AUTH_SERVICE
}

export function registerRoutes (app) {
  Object.entries(SERVICES).forEach(([route, target]) => {
    app.use(route, proxyWithBreaker(target))
  })
}

const circuitBreakerOptions = {
  timeout: 5000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
}

function buildProxyOptions (resolve, reject) {
  return {
    limit: '10mb',
    proxyErrorHandler: function () {
      reject()
    },
    userResDecorator: function (proxyRes, proxyResData, userReq, userRes) {
      resolve()
      return proxyResData
    }
  }
}

function proxyWithBreaker (target) {
  const breaker = new CircuitBreaker((req, res, next) => {
    return new Promise((resolve, reject) => {
      proxy(target, buildProxyOptions(resolve, reject))(req, res, next)
    })
  }, circuitBreakerOptions)

  return async (req, res, next) => {
    try {
      await breaker.fire(req, res, next)
    } catch (err) {
      res.status(503).send('De service is tijdelijk niet beschikbaar.')
    }
  }
}
