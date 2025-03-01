# Backend — Lang Portal

## Business Goal
A language learning school wants to build a prototype of a learning portal which will act as three things:
- Inventory of possible vocabulary that can be learned
- Act as a Learning Record Store (LRS), providing correct and wrong scores on practice vocabulary
- A unified launchpad to launch different learning apps

You have been tasked with creating the backend API of the application.

## Technical Restrictions
- Build the backend using Node.js
- Use Express.js as the web framework
- Use SQLite3 as the database
- Does not require authentication/authorization, 
- Assume there is a single user

## Technical Specification

### Project Structure
```
backend_node/
│── node_modules/        # Installed dependencies
│── src/
│   ├── controllers/     # Handles request logic
│   │   ├── words.js
│   │   ├── groups.js
│   │   ├── studySessions.js
│   │   └── wordReviews.js
│   ├── models/          # Database schema definitions
│   │   ├── word.js
│   │   ├── group.js
│   │   ├── studySession.js
│   │   └── wordReview.js
│   ├── routes/          # API routes
│   │   ├── words.js
│   │   ├── groups.js
│   │   ├── studySessions.js
│   │   ├── wordReviews.js
│   │   └── index.js
│   ├── db/              # Database setup
│   │   ├── database.js  # SQLite3 connection
│   │   ├── migrations/  # Database migration files
│   │   ├── seeds/       # Database seed files
│   ├── utils/           # Helper functions
│   │   ├── responseHelper.js
│   │   ├── validationHelper.js
│   ├── app.js           # Express app setup
│   ├── server.js        # Server entry point
│── .env                 # Environment variables
│── .gitignore           # Git ignore file
│── package.json         # Project metadata and dependencies
│── README.md            # Project documentation
```

### Routes
#### `GET /words` - Get paginated list of words with review statistics
#### `GET /groups` - Get paginated list of word groups with word counts
#### `GET /groups/:id` - Get words from a specific group (This is intended to be used by target apps)
#### `POST /study_sessions` - Create a new study session for a group
#### `POST /study_sessions/:id/review` - Log a review attempt for a word during a study session

### Request Parameters
#### `GET /words`
- `page`: Page number (default: 1)
- `sort_by`: Sort field ( `italian`, `english`, `correct_count`, `wrong_count`) (default: `italian`)
- `order`: Sort order (`asc` or `desc`) (default: `asc`)

#### `GET /groups/:id`
- `page`: Page number (default: 1)
- `sort_by`: Sort field (`name`, `words_count`) (default: `name`)
- `order`: Sort order (`asc` or `desc`) (default: `asc`)

#### `POST /study_sessions`
- `group_id`: ID of the group to study (required)
- `study_activity_id`: ID of the study activity (required)

## Database Schema

### `words` — Stores individual Italian vocabulary words.
- `id` (Integer)
- `italian` (String)
- `english` (String)
- `parts` (JSON)

### `groups` — Manages collections of words.
- `id` (Integer)
- `name` (String)
- `words_count` (Integer)

### `word_groups` — Join-table enabling many-to-many relationship between words and groups.
- `id` (Integer): 
- `word_id` (Integer)
- `group_id` (Integer)

### `study_activities` — Defines different types of study activities available.
- `id` (Integer):
- `name` (String)
- `url` (String)

### `study_sessions` — Records individual study sessions.
- `id` (Integer): 
- `group_id` (Integer) 
- `study_activity_id` (Integer)
- `created_at` (Timestamp)

### `word_review_items` — Tracks individual word reviews within study sessions.
- `id` (Integer)
- `word_id` (Integer) 
- `study_session_id` (Integer)
- `correct` (Boolean) 
- `created_at` (Timestamp)

## API Endpoints

## Dashboard

### GET /api/dashboard/last_study_session
Returns information about the most recent study session.

**JSON Response**
```json
{
  "id": 234,
  "group_id": 567,
  "created_at": "2025-02-25T14:35:42-05:00",
  "study_activity_id": 890,
  "group_name": "Food and Drinks"
}
```

### GET /api/dashboard/study_progress
Returns learning progress metrics. The frontend will display a progress bar indicating the ratio of completed vocabulary items to the total available vocabulary.

**JSON Response**
```json
{
  "total_words_studied": 2,
  "total_available_words": 100
}
```

### GET /api/dashboard/quick_stats
Returns quick overview statistics.

**JSON Response**
```json
{
  "success_rate": 70.0,
  "total_study_sessions": 2,
  "total_active_groups": 3,
  "study_streak_days": 3
}
```

## Study Activities

### GET /api/study_activities
    - to list all activities
    - Pagination with 50 items per page

### GET /api/study_activities/:id

**JSON Response**
```json
{
  "id": 1,
  "name": "Vocabulary Quiz",
  "thumbnail_url": "https://example.com/thumbnail.jpg",
  "description": "Practice your vocabulary with flashcards"
}
```

### GET /api/study_activities/:id/study_sessions
Pagination with 50 items per page

**JSON Response**
```json
{
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
```

### POST /api/study_activities/:id/launch

**Request Params**
- group_id: integer
- study_activity_id: integer

**JSON Response**
```json
{ 
  "id": 124, 
  "group_id": 123 
}
```

## Words

### GET /api/words
Pagination with 50 items per page

**JSON Response**
```json
{
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
```

### GET /api/words/:id

**JSON Response**
```json
{
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
```

## Groups

### GET /api/groups
Pagination with 50 items per page

**JSON Response**
```json
{
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
```

### GET /api/groups/:id

**JSON Response**
```json
{
  "id": 2,
  "name": "Food and Drinks",
  "stats": {
    "total_word_count": 20
  }
}
```

### GET /api/groups/:id/words

**JSON Response**
```json
{
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
```

### GET /api/groups/:id/study_sessions

**JSON Response**
```json
{
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
```

## Study Sessions

### GET /api/study_sessions
Pagination with 50 items per page

**JSON Response**
```json
{
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
```

### GET /api/study_sessions/:id

**JSON Response**
```json
{
  "id": 456,
  "activity_name": "Vocabulary Quiz",
  "group_name": "Food and Drinks",
  "start_time": "2025-02-08T17:20:23-06:00",
  "end_time": "2025-02-08T17:30:23-06:00",
  "review_items_count": 20
}
```

### GET /api/study_sessions/:id/words
Pagination with 50 items per page

**JSON Response**
```json
{
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
```

## System Management

### POST /api/reset_history

**JSON Response**
```json
{
  "success": true,
  "message": "Study history has been reset"
}
```

### POST /api/full_reset

**JSON Response**
```json
{
  "success": true,
  "message": "System has been fully reset"
}
```

## Word Reviews

### POST /api/study_sessions/:id/words/:word_id/review

**Request Params**
- id (study_session_id): integer
- word_id: integer
- correct: boolean

**Request Payload**
```json
{
  "correct": true
}
```

**JSON Response**
```json
{
  "success": true,
  "word_id": 1,
  "study_session_id": 456,
  "correct": true,
  "created_at": "2025-02-08T17:33:07-07:00"
}
```

## Task Runner

