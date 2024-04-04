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

  async createTarget (id, endTimeDate) {
    const insertQuery =
      'INSERT INTO targets(id, end_time) VALUES($1, $2) RETURNING id'
    const res = await this.query(insertQuery, [
      id,
      endTimeDate,
    ])
    return res.rows[0].id
  }

  async deleteTarget (id) {
    const deleteQuery = 'DELETE FROM targets WHERE id = $1'
    await this.query(deleteQuery, [id])
  }

  async getTarget (id) {
    const checkQuery = 'SELECT * FROM targets WHERE id = $1'
    const res = await this.query(checkQuery, [id])
    const target = res.rows.map(this.convertEndTimeToMilliseconds)[0]
    return res.rows[0]
  }
}
