import express from 'express'
import cors from 'cors'
import { errorHandler } from './utils/errorHandler'
import { requestLogger } from './utils/requestLogger'
import routes from './routes'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const app = express()

// Configure CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || ['http://localhost:5173', 'http://localhost:5174'],
  optionsSuccessStatus: 200,
  credentials: true
}

// Apply middleware
app.use(cors(corsOptions))
app.use(express.json())
app.use(requestLogger)

// API routes
app.use('/api', routes)

// Error handling
app.use(errorHandler)

export default app 