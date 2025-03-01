# Italian Language Learning Portal - Backend

This is the backend API for an Italian language learning web application. It provides endpoints for managing vocabulary, word groups, study activities, and tracking learning progress.

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **SQLite** - Database
- **TypeScript** - Programming language

## Database Schema

The application uses SQLite as its database with the following tables:

### Core Tables

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

### System Tables

1. **migrations** - Tracks applied database migrations
   - `id` - Primary key
   - `name` - Migration file name
   - `applied_at` - Timestamp when the migration was applied

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd lang-portal/backend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   PORT=3000
   NODE_ENV=development
   DB_PATH=database.sqlite
   ```

### Database Setup

The application uses a migration system to manage the database schema. To set up the database:

1. Run migrations to create the database schema:
   ```bash
   npm run migrate:run
   ```

2. Seed the database with initial data:
   ```bash
   npm run seed
   ```

### Running the Application

To start the development server:

```bash
npm run dev
```

The server will start on port 3000 (or the port specified in your `.env` file).

### Available Scripts

- `npm run dev` - Start the development server with hot reloading
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run seed` - Seed the database with initial data
- `npm run migrate` - Show migration help
- `npm run migrate:create <name>` - Create a new migration file
- `npm run migrate:run` - Run all pending migrations

## Database Management

### Migrations

The application uses a migration system to manage database schema changes. Migration files are stored in the `src/db/migrations` directory.

To create a new migration:

```bash
npm run migrate:create add_new_field_to_words
```

This will create a new migration file in the `src/db/migrations` directory with a timestamp prefix.

To run all pending migrations:

```bash
npm run migrate:run
```

### Seeding

The application includes seed data for testing and development. To seed the database:

```bash
npm run seed
```

This will populate the database with:
- 3 study activities
- 6 word groups
- 115 Italian words organized by category
- Default user preferences

## API Endpoints

The API provides endpoints for managing vocabulary, word groups, study activities, and tracking learning progress. See the [API documentation](./API.md) for details.

## Error Handling

The application includes a robust error handling system with custom error classes for different HTTP status codes. Errors are logged and formatted for consistent API responses.

## Logging

The application includes a request logger middleware that logs incoming requests and outgoing responses, including detailed information for better debugging.

## Development

For development, the application uses:
- `nodemon` for hot reloading
- `ts-node` for running TypeScript files directly
- `dotenv` for environment variables

## License

This project is licensed under the ISC License. 