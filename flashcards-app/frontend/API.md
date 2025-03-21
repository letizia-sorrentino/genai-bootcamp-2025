# Italian Flashcards API Documentation

## Base URL
```
http://localhost:3000/api
```

## Endpoints

### 1. Generate Flashcards
Generates flashcards for a given set of Italian words and category.

**Endpoint:** `POST /generate-flashcards`

**Request Body:**
```json
{
  "words": ["casa", "gatto", "cane"],
  "category": "basic"
}
```

**Response:**
```json
{
  "flashcards": [
    {
      "word": "casa",
      "translation": "house",
      "imageUrl": "https://example.com/images/casa.jpg",
      "example": "La mia casa è grande.",
      "pronunciation": "ˈkaːza"
    },
    // ... more flashcards
  ]
}
```

**Error Response:**
```json
{
  "error": "Failed to generate flashcards",
  "message": "Error details here"
}
```

### 2. Get Categories
Retrieves all available vocabulary categories.

**Endpoint:** `GET /categories`

**Response:**
```json
{
  "categories": [
    {
      "id": "basic",
      "name": "Basic Vocabulary",
      "description": "Common everyday words"
    },
    {
      "id": "food",
      "name": "Food & Drinks",
      "description": "Food and beverage related vocabulary"
    },
    // ... more categories
  ]
}
```

### 3. Get Example Words
Retrieves example words for a specific category.

**Endpoint:** `GET /example-words/:category`

**Parameters:**
- `category`: The category ID (e.g., "basic", "food", "travel")

**Response:**
```json
{
  "words": [
    "casa",
    "gatto",
    "cane",
    "albero",
    "sole"
  ]
}
```

### 4. Get Flashcard Details
Retrieves detailed information for a specific word.

**Endpoint:** `GET /flashcard/:word`

**Parameters:**
- `word`: The Italian word to look up

**Response:**
```json
{
  "word": "casa",
  "translation": "house",
  "imageUrl": "https://example.com/images/casa.jpg",
  "example": "La mia casa è grande.",
  "pronunciation": "ˈkaːza",
  "gender": "feminine",
  "plural": "case"
}
```

### 5. Save Progress
Saves user's learning progress.

**Endpoint:** `POST /progress`

**Request Body:**
```json
{
  "userId": "user123",
  "word": "casa",
  "category": "basic",
  "status": "learned",
  "timestamp": "2024-03-20T10:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Progress saved successfully"
}
```

### 6. Get User Progress
Retrieves user's learning progress.

**Endpoint:** `GET /progress/:userId`

**Parameters:**
- `userId`: The user's unique identifier

**Response:**
```json
{
  "progress": [
    {
      "word": "casa",
      "category": "basic",
      "status": "learned",
      "timestamp": "2024-03-20T10:30:00Z"
    },
    // ... more progress items
  ]
}
```

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "code": "ERROR_CODE"
}
```

Common HTTP Status Codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

## Rate Limiting

- 100 requests per minute per IP address
- 1000 requests per hour per user

## Authentication

All endpoints except `/categories` and `/example-words/:category` require authentication using a JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## CORS

The API supports CORS for the following origins:
- `http://localhost:5173` (development)
- `https://your-production-domain.com` (production) 