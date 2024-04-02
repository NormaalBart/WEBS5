import express from 'express'
import proxy from 'http-proxy-middleware'
import CircuitBreaker from 'opossum'

const app = express()
const PORT = 3000

const SERVICES = {
  '/images': process.env.IMAGE_SERVICE
}

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Logging middleware
app.use((req, res, next) => {
  console.log(`Received ${req.method} request for ${req.path}`)
  next()
})

Object.entries(SERVICES).forEach(([route, target]) => {
  app.use(route, proxyWithBreaker(target))
})

function proxyWithBreaker (target) {
  const proxyMiddleware = proxy.createProxyMiddleware({
    target: target,
    changeOrigin: true
  })

  const breakerOptions = {
    errorThresholdPercentage: 50,
    timeout: 5000,
    resetTimeout: 30000
  }

  const breaker = new CircuitBreaker(async (req, res, next) => {
    proxyMiddleware(req, res, next)
  }, breakerOptions)

  return (req, res, next) => breaker.fire(req, res, next).catch(next)
}

app.listen(PORT, () => {
  console.log(`API Gateway luistert op poort ${PORT}`)
})
