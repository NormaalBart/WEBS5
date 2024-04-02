import express from 'express'
import swaggerUi from 'swagger-ui-express'
import { registerRoutes } from './routes/register.js'
import swaggerDocument from './swagger.json' assert { type: 'json' }

const app = express()
const PORT = process.env.PORT || 3000

registerRoutes(app)

app.use('/api-docs', swaggerUi.serve, swa  ggerUi.setup(swaggerDocument))

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))