import sqlite3 from 'sqlite3'
import { open, Database } from 'sqlite'
import path from 'path'
import dotenv from 'dotenv'
import { runMigrations } from './migrationManager'

// Load environment variables
dotenv.config()

let db: Database | null = null

export async function getDb(): Promise<Database> {
  if (db) {
    return db
  }

  // Get database path from environment variables or use default
  const dbPath = process.env.DB_PATH || 'database.sqlite'

  // Open database
  db = await open({
    filename: path.resolve(__dirname, `../../${dbPath}`),
    driver: sqlite3.Database
  })

  return db
}

export async function initializeDb(): Promise<void> {
  console.log('Initializing database...')
  
  // Run migrations to create or update tables
  await runMigrations()
  
  console.log('Database initialized successfully')
} 