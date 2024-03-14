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
      const breaker = new CircuitBreaker(async (action, url, data) => {
        try {
          const response = await axios[action](url, data)
          return response
        } catch (error) {
          if (
            error.response &&
            (error.response.status === 503 || error.response.status === 504)
          ) {
            throw error
          }
          return {
            status: error.response ? error.response.status : 500,
            data: error.response ? error.response.data : 'Unknown error'
          }
        }
      }, options)

      this.breakers.set(key, breaker)
      return breaker
    }

    return this.breakers.get(key)
  }

  async get (url, req, res) {
    const breaker = this.getBreaker(url)
    return breaker
      .fire('get', url, req.body)
      .then(result => {
        res.status(result.status).send(result.data)
      })
      .catch(err => {
        res.status(503).send('Service unavailable')
      })
  }

  async post (url, req, res) {
    const breaker = this.getBreaker(url)
    return breaker
      .fire('post', url, req.body)
      .then(result => {
        res.status(result.status).send(result.data)
      })
      .catch(err => {
        res.status(503).send('Service unavailable')
      })
  }
}

export default new Breaker()
