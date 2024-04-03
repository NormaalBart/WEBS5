import pkg from 'pg'
import { v4 as uuidv4 } from 'uuid'
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

  async saveImagePath (imagePath, target, ownerId) {
    const id = uuidv4()
    await this.pool.query(
      'INSERT INTO images(id, path, target, owner_id) VALUES($1, $2, $3, $4)',
      [id, imagePath, target, ownerId]
    )
    return id
  }

  async getImagePath (id, target) {
    const { rows } = await this.pool.query(
      'SELECT path FROM images WHERE id = $1 AND target = $2',
      [id, target]
    )

    if (rows.length > 0) {
      return rows[0].path
    } else {
      return null
    }
  }

  async canDeleteImage (photoId, target, ownerId) {
    const checkQuery = 'SELECT target, owner_id FROM images WHERE id = $1'
    const checkRes = await this.query(checkQuery, [photoId])
    if (checkRes.rowCount === 0) {
      return { rowCount: 0, ownerMatch: false, targetMatch: false }
    }
    if (checkRes.rows[0].target !== target) {
      return { rowCount: 1, ownerMatch: false, targetMatch: false }
    }
    if (checkRes.rows[0].owner_id !== ownerId) {
      return { rowCount: 1, ownerMatch: false, targetMatch: true }
    }
    return { rowCount: 1, ownerMatch: true, targetMatch: true }
  }

  async deleteImage (imageId) {
    const deleteQuery = 'DELETE FROM images WHERE id = $1 RETURNING path'
    const deleteRes = await this.query(deleteQuery, [imageId])
    return deleteRes.rows[0].path
  }
}
