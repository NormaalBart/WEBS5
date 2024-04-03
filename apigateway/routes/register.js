import proxy from 'express-http-proxy'
import CircuitBreaker from 'opossum'
import { verify } from '../util/verify.js'

const SERVICES = {
  '/targets/:target/images': {
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

const circuitBreakerOptions = {
  timeout: 5000,
  errorThresholdPercentage: 50,
  resetTimeout: 3000
}

export function registerRoutes (app) {
  Object.entries(SERVICES).forEach(
    ([route, { url, requireAuth, excludeRoutes = [] }]) => {
      const proxyMiddleware = proxyWithBreaker(route, url)

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

function buildProxyOptions (resolve, reject, target, req, route) {
  return {
    limit: '10mb',
    proxyErrorHandler: function () {
      reject()
    },
    userResDecorator: function (proxyReq, proxyResData, userReq, userRes) {
      resolve()
      return proxyResData
    },
    proxyReqPathResolver: function (req) {
      const additionalPath = req.originalUrl.replace(req.baseUrl, '')
      const newPathSegments = Object.values(req.params)

      if (additionalPath) {
        newPathSegments.push(additionalPath.substring(1))
      }

      const newPath = '/' + newPathSegments.join('/')
      const fullPath = `${target.replace(/\/$/, '')}${newPath}`
      return fullPath
    }
  }
}

function proxyWithBreaker (route, target) {
  const breaker = new CircuitBreaker((req, res, next) => {
    return new Promise((resolve, reject) => {
      proxy(target, buildProxyOptions(resolve, reject, target, req, route))(
        req,
        res,
        next
      )
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
