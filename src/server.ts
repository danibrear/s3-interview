import cors from 'cors'
import express from 'express'
import pinoHttp from 'pino-http'

import { logger } from '@/logger'
import emissionsRouter from '@/routers/emissions'
import { validateQueryData } from './middleware/validations'

const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000

const app = express()
app.use(
  pinoHttp({
    logger,
    customSuccessMessage: (req, res, responseTime) => {
      return `${req.method} ${req.url} ${res.statusCode} ${responseTime}ms`
    },
    customErrorMessage: (req, res, error) => {
      return `${req.method} ${req.url} ${res.statusCode} ${error.message}`
    },
    customProps: () => ({}),
    serializers: {
      req: () => undefined,
      res: () => undefined,
      responseTime: () => undefined,
    },
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.get('/hello', (req, res) => {
  res.send('Hello, world!')
})

app.use('/emissions', validateQueryData, emissionsRouter)

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`)
})
