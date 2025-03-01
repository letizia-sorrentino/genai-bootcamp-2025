# Development Workflow

This document outlines the development workflow for the Italian Language Learning Portal, providing detailed instructions for common development tasks.

## Initial Setup

### Setting Up the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
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

### Setting Up the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory:
   ```
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

## Running the Application

### Development Mode

To run the application in development mode, you need to start both the backend and frontend servers in separate terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

This will start the backend server with hot-reloading enabled, so changes to the code will automatically restart the server.

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

This will start the Vite development server with hot module replacement, so changes to the code will be immediately reflected in the browser.

### Production Mode

To build and run the application for production:

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
```

The frontend build will generate static files in the `dist` directory, which can be served by any static file server.

## Database Management

### Creating a New Migration

To create a new migration for database schema changes:

```bash
cd backend
npm run migrate:create <migration_name>
```

This will create a new migration file in the `src/db/migrations` directory. Edit this file to define the schema changes.

### Running Migrations

To apply pending migrations:

```bash
cd backend
npm run migrate:run
```

### Seeding the Database

To seed the database with initial data:

```bash
cd backend
npm run seed
```

## Backend Development

### Adding a New API Endpoint

1. Create a new controller function in the appropriate controller file in `src/controllers/`.
2. Add a new route in the appropriate route file in `src/routes/`.
3. Update the API documentation in `API.md` to reflect the new endpoint.

### Adding a New Model

1. Create a new model file in `src/models/`.
2. Create a migration to add the corresponding table to the database.
3. Update the database documentation to reflect the new model.

## Frontend Development

### Adding a New Page

1. Create a new page component in `src/pages/`.
2. Add a new route in `src/routes.tsx`.
3. Update any navigation components to include a link to the new page.

### Adding a New API Client Function

1. Add a new function to the appropriate API client file (`src/lib/api.ts` or `src/lib/api-client.ts`).
2. Add any necessary TypeScript types to `src/lib/types/api.ts`.

## Testing

### Backend Testing

To run backend tests:

```bash
cd backend
npm test
```

### Frontend Testing

To run frontend tests:

```bash
cd frontend
npm test
```

## Code Quality

### Linting

To lint the backend code:

```bash
cd backend
npm run lint
```

To lint the frontend code:

```bash
cd frontend
npm run lint
```

### Type Checking

To check TypeScript types in the backend:

```bash
cd backend
npm run typecheck
```

To check TypeScript types in the frontend:

```bash
cd frontend
npm run typecheck
```

## Troubleshooting

### Backend Issues

- Check the backend logs for error messages.
- Verify that the database file exists and is accessible.
- Ensure that all migrations have been applied.
- Check that the environment variables are correctly set.

### Frontend Issues

- Check the browser console for error messages.
- Verify that the API base URL is correctly set in the `.env` file.
- Ensure that the backend server is running and accessible.
- Check that CORS is properly configured on the backend.

### Connection Issues

- Ensure both servers are running.
- Check that the environment variables are correctly set.
- Verify that CORS is properly configured on the backend.
- Check the browser console for any error messages.
- Verify network requests in the browser's developer tools. 