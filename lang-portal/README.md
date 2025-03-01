# Italian Language Learning Portal

A comprehensive web application for learning Italian vocabulary and tracking study progress.

## Project Structure

This project is organized as a monorepo with the following components:

- `backend/` - Node.js/Express API server with SQLite database
- `frontend/` - React.js web application
- `docs/` - Project documentation

## Features

- Vocabulary management with Italian-English translations
- Word grouping by categories (Basic Vocabulary, Food, Verbs, etc.)
- Multiple study activities (Vocabulary Quiz, Word Matching, Typing Practice)
- Study session tracking and progress statistics
- User preferences and settings

## Tech Stack

### Backend
- Node.js
- Express.js
- SQLite
- TypeScript

### Frontend
- React.js
- Tailwind CSS
- Vite.js
- TypeScript
- ShadCN components

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```
   PORT=3000
   NODE_ENV=development
   DB_PATH=database.sqlite
   CORS_ORIGIN=http://localhost:5173
   LOG_LEVEL=info
   ```

4. Run database migrations:
   ```bash
   npm run migrate:run
   ```

5. Seed the database:
   ```bash
   npm run seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

The backend server will be available at http://localhost:3000.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend development server will be available at http://localhost:5173.

### Running the Application

To run the complete application, you need to start both the backend and frontend servers in separate terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The frontend will automatically connect to the backend using the API URL specified in the environment variables.

## Documentation

The project includes comprehensive documentation in the `docs/` folder:

- [Backend Technical Specifications](docs/Backend-Technical-Specs.md)
- [Frontend Technical Specifications](docs/Frontend-Technical-Specs.md)
- [API Endpoints Comparison](docs/API-Endpoints-Comparison.md)
- [Connecting Frontend and Backend](docs/CONNECTING-FRONTEND-BACKEND.md)
- [Backend Tasks](docs/BE-tasks.md)
- [Frontend Tasks](docs/FE-tasks.md)

## Database

The application uses SQLite as its database. The database schema includes tables for:

- Words (Italian vocabulary)
- Groups (word categories)
- Study activities
- Study sessions
- Word reviews
- User preferences

For more details, see the [backend database documentation](backend/src/db/README.md).

## API Documentation

The backend provides a RESTful API for managing vocabulary, word groups, study activities, and tracking learning progress. For detailed API documentation, see [API.md](backend/API.md).

## Development

### Backend Development

The backend uses a migration system to manage database schema changes. To create a new migration:

```bash
cd backend
npm run migrate:create <migration_name>
```

For more details on backend development, see the [backend README](backend/README.md).

### Frontend Development

For more details on frontend development, see the [frontend README](frontend/README.md).

## License

This project is licensed under the ISC License. 