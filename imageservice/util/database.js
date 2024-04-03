import pkg from 'pg'
import { v4 as uuidv4 } from 'uuid'
const { Pool } = pkg

export class Database {
  constructor () {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL
    })
  }

  async saveImagePath (imagePath, target) {
    const id = uuidv4()
    await this.pool.query('INSERT INTO images(id, path, target) VALUES($1, $2, $3)', [
      id,
      imagePath,
      target
    ])
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
}
