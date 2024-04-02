import express from 'express'
import bodyParser from 'body-parser'
import swaggerUi from 'swagger-ui-express'
import { registerRoutes } from './routes/register.js'
import swaggerDocument from './swagger.json' assert { type: 'json' }

const app = express()
const PORT = process.env.PORT || 3000

registerRoutes(app)

app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))