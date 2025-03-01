# API Documentation

This document provides detailed information about the API endpoints available in the Italian Language Learning Portal backend.

## Base URL

All API endpoints are prefixed with `/api`.

## Response Format

All API responses follow a standard format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

For error responses:

```json
{
  "success": false,
  "error": {
    "code": 400,
    "message": "Error message"
  }
}
```

## Authentication

This API does not require authentication as it's designed for a single user.

## Endpoints

### Dashboard

#### GET /api/dashboard/last_study_session

Returns information about the most recent study session.

**Response**
```json
{
  "success": true,
  "data": {
    "id": 234,
    "group_id": 567,
    "created_at": "2025-02-25T14:35:42-05:00",
    "study_activity_id": 890,
    "group_name": "Food and Drinks"
  }
}
```

#### GET /api/dashboard/study_progress

Returns learning progress metrics.

**Response**
```json
{
  "success": true,
  "data": {
    "total_words_studied": 2,
    "total_available_words": 100
  }
}
```

#### GET /api/dashboard/quick_stats

Returns quick overview statistics.

**Response**
```json
{
  "success": true,
  "data": {
    "success_rate": 70.0,
    "total_study_sessions": 2,
    "total_active_groups": 3,
    "study_streak_days": 3
  }
}
```

### Study Activities

#### GET /api/study_activities

Returns a list of all study activities.

**Query Parameters**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)

**Response**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Vocabulary Quiz",
        "url": "http://localhost:8081",
        "description": "Test your vocabulary knowledge with flashcards and multiple-choice questions"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_items": 3,
      "items_per_page": 50
    }
  }
}
```

#### GET /api/study_activities/:id

Returns details for a specific study activity.

**Response**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Vocabulary Quiz",
    "url": "http://localhost:8081",
    "description": "Test your vocabulary knowledge with flashcards and multiple-choice questions"
  }
}
```

#### GET /api/study_activities/:id/study_sessions

Returns study sessions for a specific study activity.

**Query Parameters**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)

**Response**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 456,
        "activity_name": "Vocabulary Quiz",
        "group_name": "Food and Drinks",
        "start_time": "2025-02-26T17:20:23-05:00",
        "end_time": "2025-02-26T17:30:23-05:00",
        "review_items_count": 20
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 50,
      "items_per_page": 10
    }
  }
}
```

#### POST /api/study_activities/:id/launch

Launches a study activity for a specific group.

**Request Body**
```json
{
  "group_id": 123
}
```

**Response**
```json
{
  "success": true,
  "data": { 
    "id": 124, 
    "group_id": 123 
  }
}
```

### Words

#### GET /api/words

Returns a paginated list of words with review statistics.

**Query Parameters**
- `page`: Page number (default: 1)
- `sort_by`: Sort field (`italian`, `english`, `correct_count`, `wrong_count`) (default: `italian`)
- `order`: Sort order (`asc` or `desc`) (default: `asc`)

**Response**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "italian": "pomodoro",
        "english": "tomato",
        "correct_count": 5,
        "wrong_count": 2
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 250,
      "items_per_page": 50
    }
  }
}
```

#### GET /api/words/:id

Returns details for a specific word.

**Response**
```json
{
  "success": true,
  "data": {
    "italian": "pomodoro",
    "english": "tomato",
    "stats": {
      "correct_count": 5,
      "wrong_count": 2
    },
    "groups": [
      {
        "id": 2,
        "name": "Food and Drinks"
      }
    ]
  }
}
```

### Groups

#### GET /api/groups

Returns a paginated list of word groups with word counts.

**Query Parameters**
- `page`: Page number (default: 1)
- `sort_by`: Sort field (`name`, `words_count`) (default: `name`)
- `order`: Sort order (`asc` or `desc`) (default: `asc`)

**Response**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 2,
        "name": "Food and Drinks",
        "word_count": 20
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_items": 10,
      "items_per_page": 50
    }
  }
}
```

#### GET /api/groups/:id

Returns details for a specific group.

**Response**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Food and Drinks",
    "stats": {
      "total_word_count": 20
    }
  }
}
```

#### GET /api/groups/:id/words

Returns words for a specific group.

**Query Parameters**
- `page`: Page number (default: 1)
- `sort_by`: Sort field (`italian`, `english`, `correct_count`, `wrong_count`) (default: `italian`)
- `order`: Sort order (`asc` or `desc`) (default: `asc`)

**Response**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "italian": "pomodoro",
        "english": "tomato",
        "correct_count": 5,
        "wrong_count": 2
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_items": 20,
      "items_per_page": 50
    }
  }
}
```

#### GET /api/groups/:id/study_sessions

Returns study sessions for a specific group.

**Query Parameters**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)

**Response**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 456,
        "activity_name": "Vocabulary Quiz",
        "group_name": "Food and Drinks",
        "start_time": "2025-03-08T17:20:23-05:00",
        "end_time": "2025-03-08T17:30:23-05:00",
        "review_items_count": 20
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_items": 5,
      "items_per_page": 50
    }
  }
}
```

### Study Sessions

#### GET /api/study_sessions

Returns a paginated list of study sessions.

**Query Parameters**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)

**Response**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 123,
        "activity_name": "Vocabulary Quiz",
        "group_name": "Food and Drinks",
        "start_time": "2025-01-08T17:20:23-05:00",
        "end_time": "2025-01-08T17:30:23-05:00",
        "review_items_count": 20
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 50,
      "items_per_page": 50
    }
  }
}
```

#### GET /api/study_sessions/:id

Returns details for a specific study session.

**Response**
```json
{
  "success": true,
  "data": {
    "id": 456,
    "activity_name": "Vocabulary Quiz",
    "group_name": "Food and Drinks",
    "start_time": "2025-02-08T17:20:23-06:00",
    "end_time": "2025-02-08T17:30:23-06:00",
    "review_items_count": 20
  }
}
```

#### GET /api/study_sessions/:id/words

Returns words reviewed in a specific study session.

**Query Parameters**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)

**Response**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "italian": "pomodoro",
        "english": "tomato",
        "correct_count": 5,
        "wrong_count": 2
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_items": 20,
      "items_per_page": 50
    }
  }
}
```

### Word Reviews

#### POST /api/study_sessions/:id/words/:word_id/review

Records a review for a word in a study session.

**Request Body**
```json
{
  "correct": true
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "word_id": 1,
    "study_session_id": 456,
    "correct": true,
    "created_at": "2025-02-08T17:33:07-07:00"
  }
}
```

### System Management

#### POST /api/reset_history

Resets study history.

**Response**
```json
{
  "success": true,
  "message": "Study history has been reset"
}
```

#### POST /api/full_reset

Performs a full system reset.

**Response**
```json
{
  "success": true,
  "message": "System has been fully reset"
}
```

### User Preferences

#### GET /api/user_preferences

Returns the user preferences.

**Response**
```json
{
  "success": true,
  "data": {
    "theme": "light",
    "notifications_enabled": true,
    "daily_goal": 10
  }
}
```

#### PUT /api/user_preferences

Updates the user preferences.

**Request Body**
```json
{
  "theme": "dark",
  "notifications_enabled": false,
  "daily_goal": 15
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "theme": "dark",
    "notifications_enabled": false,
    "daily_goal": 15
  }
}
``` 