import { Database } from 'sqlite'
import { getDb } from './database'
import fs from 'fs'
import path from 'path'

// Create migrations table to track applied migrations
async function createMigrationsTable(db: Database): Promise<void> {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

// Get list of applied migrations
async function getAppliedMigrations(db: Database): Promise<string[]> {
  await createMigrationsTable(db)
  const migrations = await db.all('SELECT name FROM migrations ORDER BY id')
  return migrations.map(m => m.name)
}

// Get list of available migration files
function getAvailableMigrations(): string[] {
  const migrationsDir = path.join(__dirname, 'migrations')
  
  // Create migrations directory if it doesn't exist
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true })
    return []
  }
  
  return fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
    .sort()
}

// Apply a single migration
async function applyMigration(db: Database, migrationName: string): Promise<void> {
  console.log(`Applying migration: ${migrationName}`)
  
  // Import the migration file
  const migrationPath = path.join(__dirname, 'migrations', migrationName)
  
  // Convert to a path that can be required
  const relativePath = path.relative(__dirname, migrationPath)
  const modulePath = './' + relativePath.replace(/\\/g, '/').replace(/\.ts$/, '')
  
  // Dynamic import for TypeScript files
  const migration = await import(modulePath)
  
  // Begin transaction
  await db.exec('BEGIN TRANSACTION')
  
  try {
    // Run the up function from the migration
    await migration.up(db)
    
    // Record the migration as applied
    await db.run('INSERT INTO migrations (name) VALUES (?)', migrationName)
    
    // Commit the transaction
    await db.exec('COMMIT')
    console.log(`Migration applied: ${migrationName}`)
  } catch (error) {
    // Rollback on error
    await db.exec('ROLLBACK')
    console.error(`Error applying migration ${migrationName}:`, error)
    throw error
  }
}

// Run all pending migrations
export async function runMigrations(): Promise<void> {
  const db = await getDb()
  
  // Create migrations table if it doesn't exist
  await createMigrationsTable(db)
  
  // Get applied and available migrations
  const appliedMigrations = await getAppliedMigrations(db)
  const availableMigrations = getAvailableMigrations()
  
  // Filter out migrations that have already been applied
  const pendingMigrations = availableMigrations.filter(
    migration => !appliedMigrations.includes(migration)
  )
  
  if (pendingMigrations.length === 0) {
    console.log('No pending migrations to apply')
    return
  }
  
  console.log(`Found ${pendingMigrations.length} pending migrations`)
  
  // Apply each pending migration in order
  for (const migration of pendingMigrations) {
    await applyMigration(db, migration)
  }
  
  console.log('All migrations applied successfully')
}

// Create a new migration file
export function createMigration(name: string): string {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '')
  const safeName = name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
  const fileName = `${timestamp}_${safeName}.ts`
  
  const migrationsDir = path.join(__dirname, 'migrations')
  
  // Create migrations directory if it doesn't exist
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true })
  }
  
  const filePath = path.join(migrationsDir, fileName)
  
  const template = `import { Database } from 'sqlite'

export async function up(db: Database): Promise<void> {
  await db.exec(\`
    -- Your migration SQL here
  \`)
}

export async function down(db: Database): Promise<void> {
  await db.exec(\`
    -- Code to revert the migration
  \`)
}
`
  
  fs.writeFileSync(filePath, template)
  console.log(`Created migration: ${fileName}`)
  return fileName
} 