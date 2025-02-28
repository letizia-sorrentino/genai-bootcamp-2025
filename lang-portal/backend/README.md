# Language Learning Portal - Backend

Backend server for the Language Learning Portal built with Node.js, Express, and SQLite.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```bash
PORT=3000
NODE_ENV=development
```

## Development

Run the development server with hot reload:
```bash
npm run dev
```

The server will start at http://localhost:3000

## Production

1. Build the project:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## API Documentation

The API will be available at `/api` with the following endpoints:

- `GET /api/health` - Health check endpoint
- `GET /api/words` - Get list of words
- `GET /api/groups` - Get list of word groups
- More endpoints documented in the API specification

## Project Structure

```
src/
├── controllers/   # Request handlers
├── models/       # Database models
├── routes/       # API routes
├── db/           # Database setup and migrations
├── utils/        # Helper functions
├── app.ts        # Express app setup
└── server.ts     # Server entry point
```

## Database

The application uses SQLite3 as the database. The database file will be created automatically when you first run the server. 