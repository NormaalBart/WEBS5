import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

export const loadRoutes = (app, db) => {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const routesPath = path.join(__dirname, '../routes')
  fs.readdirSync(routesPath).forEach(async file => {
    if (file.endsWith('.js')) {
      const route = await import(`../routes/${file}`)
      route.register(app, db)
    }
  })
}
