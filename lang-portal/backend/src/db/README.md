# Database Migration System

This directory contains the database schema and migration system for the Italian language learning application.

## Files

- `database.ts` - Database connection and initialization
- `migrationManager.ts` - Migration system implementation
- `migrate.ts` - Command-line utility for migrations
- `seeds.ts` - Database seed data
- `seed.ts` - Command-line utility for seeding
- `migrations/` - Directory containing migration files

## Migration Commands

- `npm run migrate:create <name>` - Create a new migration file
- `npm run migrate:run` - Run all pending migrations
- `npm run migrate` - Show migration help

## Seeding Commands

- `npm run seed` - Seed the database with initial data

## Database Schema

The database consists of the following tables:

1. **words** - Stores Italian vocabulary words
   - `id` - Primary key
   - `italian` - Italian word
   - `english` - English translation
   - `parts` - JSON with additional information (e.g., part of speech)

2. **groups** - Manages collections of words
   - `id` - Primary key
   - `name` - Group name
   - `words_count` - Number of words in the group

3. **word_groups** - Join table for words and groups (many-to-many)
   - `id` - Primary key
   - `word_id` - Foreign key to words table
   - `group_id` - Foreign key to groups table

4. **study_activities** - Available study activities
   - `id` - Primary key
   - `name` - Activity name
   - `url` - URL to launch the activity
   - `description` - Description of the activity

5. **study_sessions** - Records of study sessions
   - `id` - Primary key
   - `group_id` - Foreign key to groups table
   - `study_activity_id` - Foreign key to study_activities table
   - `created_at` - Timestamp when the session was created

6. **word_review_items** - Records of word reviews during study sessions
   - `id` - Primary key
   - `word_id` - Foreign key to words table
   - `study_session_id` - Foreign key to study_sessions table
   - `correct` - Whether the review was correct
   - `created_at` - Timestamp when the review was created

7. **user_preferences** - User settings and preferences
   - `id` - Primary key
   - `theme` - UI theme preference (light/dark)
   - `notifications_enabled` - Whether notifications are enabled
   - `daily_goal` - Daily study goal (number of words)
   - `created_at` - Timestamp when the preferences were created
   - `updated_at` - Timestamp when the preferences were last updated

8. **migrations** - Tracks applied database migrations
   - `id` - Primary key
   - `name` - Migration file name
   - `applied_at` - Timestamp when the migration was applied

## How the Migration System Works

The migration system is designed to manage database schema changes in a structured and version-controlled way. It ensures that database changes are applied consistently across different environments and allows for easy rollback if needed.

### Migration Files

Migration files are stored in the `migrations/` directory and follow a naming convention of `<timestamp>_<name>.ts`. Each migration file exports two functions:

- `up(db: Database): Promise<void>` - Function to apply the migration
- `down(db: Database): Promise<void>` - Function to revert the migration

Example migration file:

```typescript
import { Database } from 'sqlite'

export async function up(db: Database): Promise<void> {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      theme TEXT DEFAULT 'light',
      notifications_enabled BOOLEAN DEFAULT 1,
      daily_goal INTEGER DEFAULT 10,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)
}

export async function down(db: Database): Promise<void> {
  await db.exec(`
    DROP TABLE IF EXISTS user_preferences;
  `)
}
```

### Migration Process

When you run `npm run migrate:run`, the following steps occur:

1. The system checks for a `migrations` table in the database and creates it if it doesn't exist
2. It retrieves a list of all applied migrations from the `migrations` table
3. It scans the `migrations/` directory for available migration files
4. It filters out migrations that have already been applied
5. It applies each pending migration in order, wrapping each in a transaction
6. For each successful migration, it records the migration name in the `migrations` table

### Creating a New Migration

To create a new migration, run:

```bash
npm run migrate:create add_new_field_to_words
```

This will create a new migration file in the `migrations/` directory with a timestamp prefix.

Edit the migration file to add your schema changes in the `up` function and the reverse changes in the `down` function.

### Best Practices

1. **Make migrations atomic**: Each migration should focus on a single change or a set of closely related changes.
2. **Always implement the down function**: This allows for rollbacks if needed.
3. **Use transactions**: Wrap complex migrations in transactions to ensure atomicity.
4. **Test migrations**: Test both the `up` and `down` functions before applying them to production.
5. **Don't modify existing migrations**: Once a migration has been applied, don't modify it. Create a new migration instead.

## Seed Data

The seed data is used to populate the database with initial data for testing and development. The seed data includes:

- 3 study activities with descriptions
- 6 word groups
- 115 Italian words organized by category
- Default user preferences

To modify the seed data, edit the `seeds.ts` file and run `npm run seed` to apply the changes. 