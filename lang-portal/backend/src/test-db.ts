import dotenv from 'dotenv'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

// Load environment variables
dotenv.config()

async function testDb() {
  try {
    console.log('Testing database connection...')
    
    // Get database path from environment variables or use default
    const dbPath = process.env.DB_PATH || 'database.sqlite'
    console.log(`Using database at: ${dbPath}`)
    
    // Open database connection
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    })
    
    console.log('Database connection successful')
    
    // Test a simple query
    try {
      const result = await db.get('SELECT sqlite_version() as version')
      console.log('SQLite version:', result.version)
    } catch (error) {
      console.error('Query failed:', error)
    }
    
    // Close the connection
    await db.close()
    console.log('Database connection closed')
    
  } catch (error) {
    console.error('Database connection failed:', error)
  }
}

testDb() 