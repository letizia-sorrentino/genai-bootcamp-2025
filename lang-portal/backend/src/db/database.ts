import sqlite3 from 'sqlite3'
import { open, Database } from 'sqlite'
import path from 'path'
import dotenv from 'dotenv'

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
  const db = await getDb()
  
  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      italian TEXT NOT NULL,
      english TEXT NOT NULL,
      parts TEXT
    );

    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      words_count INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS word_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word_id INTEGER NOT NULL,
      group_id INTEGER NOT NULL,
      FOREIGN KEY (word_id) REFERENCES words (id),
      FOREIGN KEY (group_id) REFERENCES groups (id)
    );

    CREATE TABLE IF NOT EXISTS study_activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS study_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      study_activity_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES groups (id),
      FOREIGN KEY (study_activity_id) REFERENCES study_activities (id)
    );

    CREATE TABLE IF NOT EXISTS word_review_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word_id INTEGER NOT NULL,
      study_session_id INTEGER NOT NULL,
      correct BOOLEAN NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (word_id) REFERENCES words (id),
      FOREIGN KEY (study_session_id) REFERENCES study_sessions (id)
    );
  `)
} 