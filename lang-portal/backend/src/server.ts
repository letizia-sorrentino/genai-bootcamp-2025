import app from './app'
import dotenv from 'dotenv'
import { initializeDb } from './db/database'
import { seedDatabase } from './db/seeds'

// Load environment variables
dotenv.config()

// Get port from environment variables
const port = process.env.PORT || 3000
const nodeEnv = process.env.NODE_ENV || 'development'

// Initialize database before starting the server
async function startServer() {
  try {
    // Initialize database schema
    await initializeDb()
    console.log('Database initialized')
    
    // Seed database with initial data (only in development)
    if (nodeEnv === 'development') {
      await seedDatabase()
      console.log('Database seeded')
    }
    
    // Start the server
    app.listen(port, () => {
      console.log(`Server running in ${nodeEnv} mode on port ${port}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer() 