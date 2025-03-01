# Connecting Frontend and Backend

This document explains how the frontend and backend of the Italian Language Learning Portal are connected using environment variables.

## Environment Variables

### Backend (.env)

The backend uses the following environment variables:

```
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_PATH=database.sqlite

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=info
```

- `PORT`: The port on which the backend server runs (default: 3000)
- `NODE_ENV`: The environment mode (development, production, test)
- `DB_PATH`: Path to the SQLite database file
- `CORS_ORIGIN`: The origin allowed for CORS (should match the frontend URL)
- `LOG_LEVEL`: The logging level for the application

### Frontend (.env)

The frontend uses the following environment variables:

```
VITE_API_BASE_URL=http://localhost:3000/api
```

- `VITE_API_BASE_URL`: The base URL for API requests to the backend

## How the Connection Works

1. **Backend Setup**:
   - The backend Express server runs on the port specified in the `.env` file (default: 3000)
   - CORS is configured to allow requests from the frontend origin (http://localhost:5173)
   - All API endpoints are prefixed with `/api`

2. **Frontend Setup**:
   - The frontend Vite development server runs on port 5173 by default
   - API requests use the base URL from the environment variable `VITE_API_BASE_URL`
   - Two API client implementations are available:
     - `api.ts`: Uses Axios for HTTP requests
     - `api-client.ts`: Uses the Fetch API for HTTP requests

3. **TypeScript Integration**:
   - Environment variables are typed in `src/env.d.ts` for better TypeScript support
   - API response types are defined in `src/lib/types/api.ts`

## Development Workflow

The frontend and backend are run as separate applications that communicate via HTTP requests:

1. Start the backend server in one terminal:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend development server in another terminal:
   ```bash
   cd frontend
   npm run dev
   ```

3. The frontend will make API requests to the backend using the URL specified in the environment variable.

No shared dependencies or root-level node_modules are required for this communication to work. Each application has its own dependencies and runs independently.

## Production Deployment

For production deployment, update the environment variables accordingly:

1. Backend `.env`:
   ```
   PORT=3000
   NODE_ENV=production
   DB_PATH=database.sqlite
   CORS_ORIGIN=https://your-production-frontend-url.com
   LOG_LEVEL=info
   ```

2. Frontend `.env`:
   ```
   VITE_API_BASE_URL=https://your-production-backend-url.com/api
   ```

The frontend and backend can be deployed to separate servers or hosting services as long as they can communicate via HTTP requests.

## Troubleshooting

If you encounter connection issues:

1. Ensure both servers are running
2. Check that the environment variables are correctly set
3. Verify that CORS is properly configured in the backend
4. Check the browser console for any error messages
5. Verify network requests in the browser's developer tools 