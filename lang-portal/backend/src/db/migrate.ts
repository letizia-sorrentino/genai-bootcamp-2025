import { runMigrations, createMigration } from './migrationManager'

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  try {
    switch (command) {
      case 'create':
        if (!args[1]) {
          console.error('Migration name is required')
          console.log('Usage: npm run migrate create <migration_name>')
          process.exit(1)
        }
        createMigration(args[1])
        break
      
      case 'run':
        console.log('Running migrations...')
        await runMigrations()
        break
      
      default:
        console.log('Available commands:')
        console.log('  create <name> - Create a new migration')
        console.log('  run           - Run all pending migrations')
        process.exit(1)
    }
  } catch (error) {
    console.error('Migration error:', error)
    process.exit(1)
  }
}

main() 