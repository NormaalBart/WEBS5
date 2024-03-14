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
        try {
          // Probeer het Axios verzoek uit te voeren
          const response = await axios[action](url, config);
          return response;
        } catch (error) {
          // Controleer of de foutstatus 503 of 504 is
          if (error.response && (error.response.status === 503 || error.response.status === 504)) {
            // Voor 503 en 504, gooi de fout zodat de breaker kan 'breken'
            throw error;
          }
          // Voor alle andere fouten, return een aangepaste foutresponse
          // Dit zorgt ervoor dat de breaker niet 'breekt' voor deze fouten
          return {
            status: error.response ? error.response.status : 500,
            data: error.response ? error.response.data : 'Unknown error',
          };
        }
      }, options);

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
        console.log(err)
        res.status(503).send('Service unavailable')
      })
  }
}

export default new Breaker()
