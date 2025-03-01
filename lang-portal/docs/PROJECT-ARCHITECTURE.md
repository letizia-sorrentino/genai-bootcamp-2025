# Project Architecture

This document provides a comprehensive overview of the Italian Language Learning Portal's architecture, explaining how the different components work together.

## High-Level Architecture

The Italian Language Learning Portal follows a client-server architecture with a clear separation between the frontend and backend:

```
┌─────────────────┐      HTTP/REST      ┌─────────────────┐
│                 │                     │                 │
│    Frontend     │<------------------->│     Backend     │
│  (React + Vite) │                     │ (Node + Express)│
│                 │                     │                 │
└─────────────────┘                     └─────────────────┘
                                               │
                                               │
                                               ▼
                                        ┌─────────────────┐
                                        │                 │
                                        │    Database     │
                                        │    (SQLite)     │
                                        │                 │
                                        └─────────────────┘
```

## Frontend Architecture

The frontend is built with React.js, TypeScript, and Tailwind CSS, using Vite as the build tool and development server.

### Key Frontend Components

- **React Router**: Handles client-side routing
- **API Clients**: Two implementations for making HTTP requests to the backend
  - `api.ts`: Uses Axios
  - `api-client.ts`: Uses the Fetch API
- **TypeScript Types**: Defines interfaces for API responses and data models
- **ShadCN Components**: Provides UI components with a consistent design

### Frontend Directory Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   ├── lib/             # Utilities and API clients
│   │   ├── api.ts       # Axios-based API client
│   │   ├── api-client.ts # Fetch-based API client
│   │   ├── hooks/       # Custom React hooks
│   │   └── types/       # TypeScript type definitions
│   ├── pages/           # Page components for each route
│   ├── App.tsx          # Main application component
│   ├── env.d.ts         # TypeScript definitions for env variables
│   ├── index.css        # Global styles
│   ├── main.tsx         # Application entry point
│   └── routes.tsx       # Route definitions
├── .env                 # Environment variables
├── index.html           # HTML entry point
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## Backend Architecture

The backend is built with Node.js, Express.js, TypeScript, and SQLite, providing a RESTful API for the frontend.

### Key Backend Components

- **Express.js**: Web framework for handling HTTP requests
- **SQLite**: Embedded database for storing application data
- **Migration System**: Manages database schema changes
- **Controllers**: Handle request processing logic
- **Routes**: Define API endpoints
- **Models**: Define database schema and operations

### Backend Directory Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── db/              # Database setup and migrations
│   │   ├── database.ts  # Database connection
│   │   ├── migrations/  # Migration files
│   │   ├── migrationManager.ts # Migration system
│   │   └── seeds.ts     # Seed data
│   ├── models/          # Data models
│   ├── routes/          # API route definitions
│   ├── utils/           # Utility functions
│   ├── app.ts           # Express application setup
│   └── server.ts        # Server entry point
├── .env                 # Environment variables
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## Communication Between Frontend and Backend

The frontend and backend communicate via HTTP requests using a RESTful API. The connection is configured using environment variables:

1. **Backend** serves the API on port 3000 (configurable via `.env`)
2. **Frontend** makes requests to the API using the URL from the `VITE_API_BASE_URL` environment variable
3. **CORS** is configured on the backend to allow requests from the frontend origin

For detailed information on how the frontend and backend connect, see [CONNECTING-FRONTEND-BACKEND.md](CONNECTING-FRONTEND-BACKEND.md).

## Database Schema

The application uses SQLite with the following tables:

- **words**: Stores Italian vocabulary words
- **groups**: Manages collections of words
- **word_groups**: Join table for words and groups
- **study_activities**: Defines different types of study activities
- **study_sessions**: Records individual study sessions
- **word_review_items**: Tracks individual word reviews
- **user_preferences**: Stores user settings

For detailed information on the database schema, see [Backend Technical Specifications](Backend-Technical-Specs.md).

## API Endpoints

The backend provides a RESTful API with endpoints for:

- Dashboard statistics
- Words and word groups
- Study activities and sessions
- User preferences
- System management

For a complete list of API endpoints, see [API.md](../backend/API.md) and [API-Endpoints-Comparison.md](API-Endpoints-Comparison.md).

## Development Workflow

The frontend and backend are developed and run independently:

1. **Backend Development**:
   - Run the backend server: `cd backend && npm run dev`
   - Create migrations: `npm run migrate:create <name>`
   - Run migrations: `npm run migrate:run`
   - Seed the database: `npm run seed`

2. **Frontend Development**:
   - Run the frontend server: `cd frontend && npm run dev`
   - Build for production: `npm run build`

For more information on the development workflow, see the README files in the respective directories.

## Deployment

The application can be deployed in various ways:

1. **Development**: Run both servers locally
2. **Production**: Deploy the frontend and backend to separate hosting services
   - Update environment variables to point to the correct URLs
   - Configure CORS on the backend to allow requests from the frontend domain

## Future Enhancements

Potential areas for future development:

1. **Authentication**: Add user authentication and authorization
2. **Mobile Support**: Enhance the frontend for mobile devices
3. **Additional Study Activities**: Implement more learning tools
4. **Performance Optimization**: Improve database queries and frontend rendering
5. **Internationalization**: Add support for multiple languages 