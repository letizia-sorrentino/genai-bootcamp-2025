import { seedDatabase } from './seeds'

async function runSeed() {
  try {
    console.log('Starting database seeding...')
    await seedDatabase()
    console.log('Database seeding completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  }
}

runSeed() 