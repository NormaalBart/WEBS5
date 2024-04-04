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

  async createScore (targetId, ownerId, uuid, tags) {
    const text =
      'INSERT INTO image_tags(target_id, owner_id, image_uuid, tags) VALUES($1, $2, $3, $4) RETURNING id'
    const params = [targetId, ownerId, uuid, tags]
    const res = await this.query(text, params)
    return res.rows[0].id
  }

  async getOriginalScore (targetId) {
    const text = 'SELECT tags FROM image_tags WHERE target_id = $1'
    const params = [targetId]
    const res = await this.query(text, params)
    if (res.rowCount === 0) {
      return null
    }
    return res.rows[0].tags
  }

  async insertImageResult (targetId, imageUuid, ownerId, score) {
    const text =
      'INSERT INTO image_results(target_id, image_uuid, owner_id, score) VALUES($1, $2, $3, $4) RETURNING id'
    const params = [targetId, imageUuid, ownerId, score]
    const res = await this.query(text, params)
    return res.rows[0].id
  }

  async getImageResultByTargetId (uuid, target) {
    const text =
      'SELECT * FROM image_results WHERE image_uuid = $1 AND target_id = $2'
    const params = [uuid, target]
    const res = await this.query(text, params)
    return res.rows
  }

  async getImageResultsByTargetId (targetId, ownerId) {
    const ownershipCheckQuery =
      'SELECT 1 FROM image_tags WHERE target_id = $1 AND owner_id = $2'
    const ownershipCheckParams = [targetId, ownerId]
    const ownershipCheckRes = await this.query(
      ownershipCheckQuery,
      ownershipCheckParams
    )

    if (ownershipCheckRes.rowCount === 0) {
      return { isOwner: false, data: [] }
    }

    const resultsQuery = 'SELECT * FROM image_results WHERE target_id = $1'
    const resultsParams = [targetId]
    const resultsRes = await this.query(resultsQuery, resultsParams)

    return { isOwner: true, data: resultsRes.rows }
  }
}
