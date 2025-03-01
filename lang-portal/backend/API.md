# Language Learning Portal API Documentation

This document provides a comprehensive overview of the Language Learning Portal API endpoints.

## Base URL

All API endpoints are prefixed with `/api`.

## Authentication

Currently, the API does not require authentication.

## Response Format

Most API responses follow a standard format:

```json
{
  "success": true,
  "data": { ... }
}
```

For paginated responses:

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "current_page": 1,
    "total_pages": 10,
    "total_items": 500,
    "items_per_page": 50
  }
}
```

## Error Handling

Errors are returned in the following format:

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE"
  }
}
```

## API Endpoints

### Health Check

#### GET /api/health

Check if the API is running.

**Response:**
```json
{
  "status": "ok"
}
```

### Words

#### GET /api/words

Get a paginated list of words.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `sort_by` (optional): Field to sort by (default: "italian")
  - Valid values: "italian", "english", "correct_count", "wrong_count"
- `order` (optional): Sort order (default: "asc")
  - Valid values: "asc", "desc"

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "italian": "ciao",
      "english": "hello",
      "correct_count": 10,
      "wrong_count": 2
    },
    ...
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 10,
    "total_items": 500,
    "items_per_page": 50
  }
}
```

#### GET /api/words/:id

Get a single word by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "italian": "ciao",
    "english": "hello",
    "stats": {
      "correct_count": 10,
      "wrong_count": 2
    },
    "groups": [
      {
        "id": 1,
        "name": "Greetings"
      }
    ]
  }
}
```

### Groups

#### GET /api/groups

Get a paginated list of word groups.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `sort_by` (optional): Field to sort by (default: "name")
- `order` (optional): Sort order (default: "asc")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Greetings",
      "description": "Common greetings in Italian",
      "word_count": 15
    },
    ...
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 25,
    "items_per_page": 50
  }
}
```

#### GET /api/groups/:id

Get a single group by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Greetings",
    "description": "Common greetings in Italian",
    "word_count": 15
  }
}
```

#### GET /api/groups/:id/words

Get words for a specific group.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "italian": "ciao",
      "english": "hello"
    },
    ...
  ]
}
```

#### GET /api/groups/:id/study_sessions

Get study sessions for a specific group.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "started_at": "2023-01-01T12:00:00Z",
      "completed_at": "2023-01-01T12:15:00Z",
      "correct_count": 12,
      "wrong_count": 3
    },
    ...
  ]
}
```

### Dashboard

#### GET /api/dashboard/last_study_session

Get information about the last study session.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 42,
    "started_at": "2023-01-01T12:00:00Z",
    "completed_at": "2023-01-01T12:15:00Z",
    "activity": {
      "id": 1,
      "name": "Flashcards"
    },
    "group": {
      "id": 3,
      "name": "Food"
    },
    "correct_count": 12,
    "wrong_count": 3
  }
}
```

#### GET /api/dashboard/study_progress

Get study progress over time.

**Query Parameters:**
- `period` (optional): Time period (default: "week")
  - Valid values: "week", "month", "year"

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2023-01-01",
      "correct_count": 45,
      "wrong_count": 12,
      "total_count": 57
    },
    ...
  ]
}
```

#### GET /api/dashboard/quick_stats

Get quick statistics about the user's learning progress.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_words": 500,
    "words_studied": 320,
    "total_study_sessions": 42,
    "total_study_time_minutes": 840,
    "average_accuracy": 0.85
  }
}
```

### Study Activities

#### GET /api/study_activities

Get all available study activities.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Flashcards",
      "description": "Test your vocabulary knowledge with flashcards",
      "icon": "flashcard"
    },
    ...
  ]
}
```

#### GET /api/study_activities/:id

Get a single study activity by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Flashcards",
    "description": "Test your vocabulary knowledge with flashcards",
    "icon": "flashcard",
    "settings": {
      "review_mode": "italian_to_english",
      "time_limit_seconds": 30
    }
  }
}
```

#### GET /api/study_activities/:id/study_sessions

Get study sessions for a specific activity.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "started_at": "2023-01-01T12:00:00Z",
      "completed_at": "2023-01-01T12:15:00Z",
      "group": {
        "id": 3,
        "name": "Food"
      },
      "correct_count": 12,
      "wrong_count": 3
    },
    ...
  ]
}
```

#### POST /api/study_activities/:id/launch

Launch a study activity.

**Request Body:**
```json
{
  "group_id": 3,
  "settings": {
    "review_mode": "english_to_italian",
    "word_count": 20
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "study_session_id": 43,
    "words": [
      {
        "id": 5,
        "italian": "pane",
        "english": "bread"
      },
      ...
    ]
  }
}
```

### Study Sessions

#### GET /api/study_sessions

Get all study sessions.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `sort_by` (optional): Field to sort by (default: "started_at")
- `order` (optional): Sort order (default: "desc")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 42,
      "started_at": "2023-01-01T12:00:00Z",
      "completed_at": "2023-01-01T12:15:00Z",
      "activity": {
        "id": 1,
        "name": "Flashcards"
      },
      "group": {
        "id": 3,
        "name": "Food"
      },
      "correct_count": 12,
      "wrong_count": 3
    },
    ...
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 42,
    "items_per_page": 10
  }
}
```

#### GET /api/study_sessions/:id

Get a single study session by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 42,
    "started_at": "2023-01-01T12:00:00Z",
    "completed_at": "2023-01-01T12:15:00Z",
    "activity": {
      "id": 1,
      "name": "Flashcards"
    },
    "group": {
      "id": 3,
      "name": "Food"
    },
    "correct_count": 12,
    "wrong_count": 3,
    "duration_seconds": 900
  }
}
```

#### GET /api/study_sessions/:id/words

Get words for a specific study session.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "italian": "pane",
      "english": "bread",
      "review_status": "correct"
    },
    ...
  ]
}
```

#### POST /api/study_sessions/:id/words/:word_id/review

Record a word review in a study session.

**Request Body:**
```json
{
  "correct": true,
  "time_taken_ms": 2500
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session_stats": {
      "correct_count": 13,
      "wrong_count": 3,
      "remaining_words": 4
    }
  }
}
```

### User Preferences

#### GET /api/user_preferences

Get user preferences.

**Response:**
```json
{
  "success": true,
  "data": {
    "theme": "light",
    "review_mode": "italian_to_english",
    "daily_goal_minutes": 15,
    "notifications_enabled": true
  }
}
```

#### PUT /api/user_preferences

Update user preferences.

**Request Body:**
```json
{
  "theme": "dark",
  "review_mode": "english_to_italian",
  "daily_goal_minutes": 30,
  "notifications_enabled": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "theme": "dark",
    "review_mode": "english_to_italian",
    "daily_goal_minutes": 30,
    "notifications_enabled": false
  }
}
```

### System Management

#### POST /api/reset_history

Reset study history while preserving words and groups.

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Study history has been reset successfully"
  }
}
```

#### POST /api/full_reset

Perform a full system reset (warning: deletes all data).

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "System has been fully reset successfully"
  }
}
``` 