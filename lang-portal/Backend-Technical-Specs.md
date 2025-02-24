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
- `id` (Integer, Primary Key): Unique identifier for each word
- `italian` (String, Required): the word in Italian
- `english` (String, Required): English translation of the word
- `parts` (JSON, Required): Word components stored in JSON format

### `groups` — Manages collections of words.
- `id` (Integer, Primary Key): Unique identifier for each group
- `name` (String, Required): Name of the group
- `words_count` (Integer, Default: 0): Counter cache for the number of words in the group

### `word_groups` — Join-table enabling many-to-many relationship between words and groups.
- `id` (Integer, Primary Key): Unique identifier for each relationship
- `word_id` (Integer, Foreign Key): References `words.id`
- `group_id` (Integer, Foreign Key): References `groups.id`

### `study_activities` — Defines different types of study activities available.
- `id` (Integer, Primary Key): Unique identifier for each activity
- `name` (String, Required): Name of the activity (e.g., "Flashcards", "Quiz")
- `url` (String, Required): The full URL of the study activity

### `study_sessions` — Records individual study sessions.
- `id` (Integer, Primary Key): Unique identifier for each session
- `group_id` (Integer, Foreign Key): References `groups.id`
- `study_activity_id` (Integer, Foreign Key): References `study_activities.id`
- `created_at` (Timestamp, Default: Current Time): When the session was created

### `word_review_items` — Tracks individual word reviews within study sessions.
- `id` (Integer, Primary Key): Unique identifier for each review
- `word_id` (Integer, Foreign Key): References `words.id`
- `study_session_id` (Integer, Foreign Key): References `study_sessions.id`
- `correct` (Boolean, Required): Whether the answer was correct
- `created_at` (Timestamp, Default: Current Time): When the review occurred

## Relationships
- `word` belongs to `groups` through `word_groups`
- `group` belongs to `words` through `word_groups`
- `session` belongs to a `group`
- `session` belongs to a `study_activity`
- `session` has many `word_review_items`
- `word_review_item` belongs to a `study_session`
- `word_review_item` belongs to a `word`

## Design Notes
- All tables use auto-incrementing primary keys
- Timestamps are automatically set on creation where applicable
- Foreign key constraints maintain referential integrity
- JSON storage for word parts allows flexible component storage
- Counter cache on `groups.words_count` optimizes word counting queries

## API Endpoints
- `GET /words`
- `GET /groups`
- `GET /groups/:id`
- `POST /study_sessions`
- `POST /study_sessions/:id/review`

