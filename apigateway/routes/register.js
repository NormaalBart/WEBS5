import proxy from 'express-http-proxy'
import CircuitBreaker from 'opossum'
import { verify } from '../util/verify.js'

const SERVICES = {
  '/images': {
    url: process.env.IMAGE_SERVICE,
    requireAuth: true,
    excludeRoutes: []
  },
  '/auth': {
    url: process.env.AUTH_SERVICE,
    requireAuth: false,
    excludeRoutes: ['/verify']
  },
  '/targets': {
    url: process.env.TARGET_SERVICE,
    requireAuth: true,
    excludeRoutes: []
  }
}

export function registerRoutes (app) {
  Object.entries(SERVICES).forEach(
    ([route, { url, requireAuth, excludeRoutes = [] }]) => {
      const proxyMiddleware = proxyWithBreaker(url)

      const checkExcludeRoutes = (req, res, next) => {
        const path = req.path.replace(route, '')
        if (excludeRoutes.includes(path)) {
          return res.status(404).send({ error: 'Not found' })
        }
        next()
      }

      // Bepaal de te gebruiken middleware
      const middlewares = [checkExcludeRoutes]
      if (requireAuth) {
        middlewares.push(verify)
      }
      middlewares.push(proxyMiddleware)

      app.use(route, ...middlewares)
    }
  )
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
    userResDecorator: function (proxyReq, proxyResData, userReq, userRes) {
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
