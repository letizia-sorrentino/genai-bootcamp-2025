# Language Learning Portal

A modern web application for Italian language learning, built with React, TypeScript, and Tailwind CSS.

## Tech Stack

- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Component Library**: ShadCN UI
- **State Management**: Redux Toolkit
- **Build Tool**: Vite
- **Testing**: Vitest
- **API Client**: Custom fetch-based client with error handling and pagination support

## Features

- **Dashboard**: Overview of study progress and recent activity
- **Study Activities**: Launch and manage different learning activities
- **Word Management**: Browse and search Italian vocabulary
- **Word Groups**: Organize words into thematic groups
- **Study Sessions**: Track and review learning sessions
- **Settings**: Configure app preferences and reset data

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Run Tests**
   ```bash
   npm run test
   ```

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── ui/        # ShadCN UI components
│   │   └── ...        # Custom components
│   ├── lib/           # Utility functions and types
│   │   ├── types/     # TypeScript interfaces and types
│   │   └── ...        # Utility functions
│   ├── pages/         # Page components
│   ├── store/         # Redux store configuration and slices
│   ├── hooks/         # Custom React hooks
│   ├── tests/         # Test files
│   ├── App.tsx        # Main application component
│   └── main.tsx       # Application entry point
├── public/            # Static assets
└── tests/             # Test files
```

## State Management

The application uses Redux Toolkit for state management, with the following slices:

- **sessionStats**: Tracks study session statistics and progress
- **words**: Manages word data and pagination
- **groups**: Handles word group data
- **studyActivities**: Manages study activity data
- **settings**: Stores user preferences

## API Integration

The application uses a custom API client (`api-client.ts`) that provides:

- Automatic error handling
- Pagination support
- Type-safe API calls
- Response transformation

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run tests
4. Submit a pull request

## License

MIT
