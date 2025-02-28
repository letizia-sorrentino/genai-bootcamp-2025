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

