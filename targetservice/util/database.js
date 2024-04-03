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

  async createTarget (name, longitude, latitude, endTimeDate) {
    const text =
      'INSERT INTO targets(name, longitude, latitude, end_time) VALUES($1, $2, $3, $4) RETURNING id'
    const params = [name, longitude, latitude, endTimeDate.toISOString()]
    const res = await this.query(text, params)
    return res.rows[0].id
  }

  async deleteTarget (targetId) {
    const text = 'DELETE FROM targets WHERE id = $1 RETURNING id'
    const params = [targetId]
    const res = await this.query(text, params)
    return res.rowCount
  }

  async getTargets () {
    const text = 'SELECT id, name, longitude, latitude, end_time FROM targets'
    const res = await this.query(text)
    const targets = res.rows.map(this.convertEndTimeToMilliseconds)
    return targets
  }

  async getTargetById (targetId) {
    const text =
      'SELECT id, name, longitude, latitude, end_time FROM targets WHERE id = $1'
    const params = [targetId]
    const res = await this.query(text, params)
    const target = res.rows.map(this.convertEndTimeToMilliseconds)[0]
    return target
  }

  convertEndTimeToMilliseconds (target) {
    return {
      ...target,
      end_time: new Date(target.end_time).getTime()
    }
  }
}
