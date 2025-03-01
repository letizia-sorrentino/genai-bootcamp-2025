# Backend Tasks

## 1. Project Setup
- [ ] Initialize Node.js project with Express
- [ ] Set up SQLite3 database
- [ ] Create project folder structure
- [ ] Configure environment variables
- [ ] Set up error handling middleware

## 2. Database Setup
- [ ] Create database migrations for:
  - [ ] words table
  - [ ] groups table
  - [ ] word_groups table
  - [ ] study_activities table
  - [ ] study_sessions table
  - [ ] word_review_items table
- [ ] Create seed data for:
  - [ ] Initial word list
  - [ ] Default word groups
  - [ ] Study activities

## 3. API Routes Implementation

### Dashboard Endpoints
- [ ] GET /api/dashboard/last_study_session
- [ ] GET /api/dashboard/study_progress
- [ ] GET /api/dashboard/quick_stats

### Study Activities
- [ ] GET /api/study_activities
- [ ] GET /api/study_activities/:id
- [ ] GET /api/study_activities/:id/study_sessions
- [ ] POST /api/study_activities/:id/launch

### Words Management
- [ ] GET /api/words (with pagination & sorting)
- [ ] GET /api/words/:id

### Groups Management
- [ ] GET /api/groups (with pagination)
- [ ] GET /api/groups/:id
- [ ] GET /api/groups/:id/words
- [ ] GET /api/groups/:id/study_sessions

### Study Sessions
- [ ] GET /api/study_sessions (with pagination)
- [ ] GET /api/study_sessions/:id
- [ ] GET /api/study_sessions/:id/words
- [ ] POST /api/study_sessions/:id/words/:word_id/review

### System Management
- [ ] POST /api/reset_history
- [ ] POST /api/full_reset

## 4. Controllers Implementation
- [ ] Create WordsController
  - [ ] Implement pagination logic
  - [ ] Implement sorting functionality
- [ ] Create GroupsController
  - [ ] Add word count calculations
  - [ ] Handle group statistics
- [ ] Create StudySessionsController
  - [ ] Manage session creation
  - [ ] Handle session statistics
- [ ] Create WordReviewsController
  - [ ] Process review submissions
  - [ ] Update statistics

## 5. Models Implementation
- [ ] Create Word model
  - [ ] Add relationships
  - [ ] Add statistics methods
- [ ] Create Group model
  - [ ] Add word associations
  - [ ] Add counting methods
- [ ] Create StudySession model
  - [ ] Add relationships
  - [ ] Add statistics calculations
- [ ] Create WordReview model
  - [ ] Add validation
  - [ ] Add statistics updates

## 6. Utilities
- [ ] Create response helper
  - [ ] Standard response format
  - [ ] Error response format
- [ ] Create validation helper
  - [ ] Request validation
  - [ ] Parameter validation

## 7. Testing
- [ ] Set up testing environment
- [ ] Write tests for:
  - [ ] API endpoints
  - [ ] Controllers
  - [ ] Models
  - [ ] Utilities

## 8. Documentation
- [ ] Write API documentation
- [ ] Add setup instructions
- [ ] Document database schema
- [ ] Add usage examples

## 9. Performance & Security
- [ ] Add request rate limiting
- [ ] Implement error logging
- [ ] Add input sanitization
- [ ] Optimize database queries 