import { createProxyMiddleware } from 'http-proxy-middleware'
import CircuitBreaker from 'opossum'

const SERVICES = {
  '/images': process.env.IMAGE_SERVICE
}

export function registerRoutes (app) {
  Object.entries(SERVICES).forEach(([route, target]) => {
    app.use(route, proxyWithBreaker(target))
  })
}

function proxyWithBreaker (target) {
  const proxyMiddleware = createProxyMiddleware({
    target: target,
    changeOrigin: true
  })

  const breakerOptions = {
    errorThresholdPercentage: 50,
    timeout: 5000,
    resetTimeout: 30000
  }

  const breaker = new CircuitBreaker(
    (request, response) =>
      proxyMiddleware(request, response, err => {
        console.log(err)
      }),
    breakerOptions
  )

  return (req, res) => breaker.fire(req, res)
}
