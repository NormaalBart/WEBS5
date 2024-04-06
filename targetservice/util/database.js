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

  async createTarget (
    name,
    longitude,
    latitude,
    ownerId,
    endTimeDate,
    filePath
  ) {
    const text =
      'INSERT INTO targets(name, longitude, latitude, owner_id, end_time, image_path) VALUES($1, $2, $3, $4, $5, $6) RETURNING id'
    const params = [
      name,
      longitude,
      latitude,
      ownerId,
      endTimeDate.toISOString(),
      filePath
    ]
    const res = await this.query(text, params)
    return res.rows[0].id
  }

  async updateTarget (targetId, winner) {
    const checkQuery = 'UPDATE targets SET winner = $1 WHERE id = $2'
    await this.query(checkQuery, [winner, targetId])
  }

  async deleteTarget (targetId, ownerId, role) {
    const checkQuery = 'SELECT owner_id FROM targets WHERE id = $1'
    const checkRes = await this.query(checkQuery, [targetId])
    if (checkRes.rowCount === 0) {
      return { rowCount: 0, ownerMatch: false }
    }
    if (checkRes.rows[0].owner_id !== ownerId && role !== 'admin') {
      return { rowCount: 1, ownerMatch: false }
    }

    const deleteQuery = 'DELETE FROM targets WHERE id = $1 RETURNING id'
    const deleteRes = await this.query(deleteQuery, [targetId])
    return { rowCount: deleteRes.rowCount, ownerMatch: true }
  }

  async getTargets () {
    const text = 'SELECT * FROM targets'
    const res = await this.query(text)
    const targets = res.rows.map(this.convertEndTimeToMilliseconds)
    return targets
  }

  async getTargetById (targetId) {
    const text = 'SELECT * FROM targets WHERE id = $1'
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
