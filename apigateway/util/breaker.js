// breaker.js
import CircuitBreaker from 'opossum'
import axios from 'axios'

class Breaker {
  constructor () {
    this.breakers = new Map()
  }

  getBreaker (key) {
    if (!this.breakers.has(key)) {
      const options = {
        timeout: 1000,
        errorThresholdPercentage: 50,
        resetTimeout: 5000
      }
      const breaker = new CircuitBreaker(async (action, url, config) => {
        return await axios[action](url, config)
      }, options)

      this.breakers.set(key, breaker)
      return breaker
    }

    return this.breakers.get(key)
  }

  async get (url, req, res, config = {}) {
    const breaker = this.getBreaker(url)
    return breaker
      .fire('get', url, config)
      .then(result => {
        res.send(result.data)
      })
      .catch(err => {
        res.status(503).send('Service unavailable')
      })
  }

  async post (url, req, res, data = {}, config = {}) {
    const breaker = this.getBreaker(url)
    return breaker
      .fire('post', url, { ...config, data })
      .then(result => {
        res.send(result.data)
      })
      .catch(err => {
        res.status(503).send('Service unavailable')
      })
  }
}

export default new Breaker()
