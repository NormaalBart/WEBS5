import pkg from 'pg'
const { Pool } = pkg

export class Database {
  constructor () {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL
    })
  }

  async query (text, params) {
    const res = await this.pool.query(text, params)
    return res
  }

  async userExists (username) {
    const res = await this.query('SELECT * FROM users WHERE username = $1', [
      username
    ])
    return res.rows.length > 0
  }

  async registerUser (username, hashedPassword) {
    const res = await this.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id',
      [username, hashedPassword]
    )
    return res.rows[0]
  }

  async getUserByUsername (username) {
    const res = await this.query('SELECT * FROM users WHERE username = $1', [
      username
    ])
    return res.rows[0]
  }
}
