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

  async userExists (mail) {
    const res = await this.query('SELECT * FROM users WHERE mail = $1', [
      mail
    ])
    return res.rows.length > 0
  }

  async registerUser (username, mail, hashedPassword) {
    const res = await this.query(
      'INSERT INTO users (username, mail, password) VALUES ($1, $2, $3) RETURNING id',
      [username, mail, hashedPassword]
    )
    return res.rows[0]
  }

  async getUserByMail (mail) {
    const res = await this.query('SELECT * FROM users WHERE mail = $1', [
      mail
    ])
    return res.rows[0]
  }

  async getUserById (id) {
    const res = await this.query('SELECT * FROM users WHERE id = $1', [
      id
    ])
    return res.rows[0]
  }
}
