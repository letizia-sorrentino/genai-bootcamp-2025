# Italian Flashcards API Documentation

## Base URL
```
http://localhost:3000/api
```

## Endpoints

### 1. Generate Flashcards
Generates flashcards for all words in a given category.

**Endpoint:** `POST /generate-flashcards`

**Request Body:**
```json
{
  "category": "greetings"
}
```

**Response:**
```json
{
  "flashcards": [
    {
      "word": "ciao",
      "translation": "hello/goodbye"
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
Retrieves all available vocabulary categories, including user's favorites.

**Endpoint:** `GET /categories`

**Response:**
```json
{
  "categories": [
    {
      "id": "favorites",
      "name": "Favorites",
      "description": "Your favorite words",
      "words": [
        {
          "word": "ciao",
          "translation": "hello/goodbye",
          "example": "Ciao, come stai?",
          "pronunciation": "tʃaʊ"
        }
      ]
    },
    {
      "id": "greetings",
      "name": "Greetings",
      "description": "Common greetings and expressions"
    },
    // ... other categories
  ]
}
```

### 3. Get Specific Category
Retrieves details for a specific category.

**Endpoint:** `GET /categories/:categoryId`

**Parameters:**
- `categoryId`: The ID of the category to retrieve

**Response:**
```json
{
  "id": "greetings",
  "name": "Greetings",
  "description": "Common greetings and expressions",
  "words": [
    {
      "word": "ciao",
      "translation": "hello/goodbye",
      "example": "Ciao, come stai?",
      "pronunciation": "tʃaʊ"
    }
  ]
}
```

### 4. Get Words by Category
Retrieves all words for a specific category.

**Endpoint:** `GET /words/:categoryId`

**Parameters:**
- `categoryId`: The ID of the category

**Response:**
```json
{
  "words": [
    {
      "word": "ciao",
      "translation": "hello/goodbye",
      "example": "Ciao, come stai?",
      "pronunciation": "tʃaʊ"
    }
  ]
}
```

### 5. Get Example Words
Retrieves example words for all categories or a specific category.

**Endpoint:** `GET /example-words` or `GET /example-words/:category`

**Parameters:**
- `category`: (Optional) The category ID to get examples for

**Response:**
```json
{
  "greetings": ["ciao", "buongiorno", "arrivederci", "salve", "buonasera"],
  "numbers": ["uno", "due", "tre", "quattro", "cinque"],
  "colors": ["rosso", "blu", "verde", "giallo", "nero"],
  "food": ["pizza", "pasta", "gelato", "caffè", "vino"],
  "animals": ["gatto", "cane", "uccello", "leone", "elefante"],
  "family": ["madre", "padre", "sorella", "fratello", "nonna"],
  "travel": ["aeroporto", "hotel", "biglietto", "valigia", "passaporto"],
  "common-phrases": ["grazie", "prego", "scusa", "per favore", "mi dispiace"]
}
```

### 6. Get Model Configuration
Retrieves the current AI model configuration.

**Endpoint:** `GET /config/model`

**Response:**
```json
{
  "currentModel": "nova-canvas",
  "availableModels": ["nova-canvas", "dalle"],
  "config": {
    // Model-specific configuration
  }
}
```

### 7. Update Model Configuration
Updates the AI model configuration.

**Endpoint:** `POST /config/model`

**Request Body:**
```json
{
  "model": "nova-canvas"
}
```

**Response:**
```json
{
  "message": "Model updated successfully",
  "currentModel": "nova-canvas",
  "config": {
    // Updated model configuration
  }
}
```

### 8. Get Flashcard Details
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

### 9. Save Progress
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

### 10. Get User Progress
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
  "message": "Detailed error message"
}
```

Common HTTP Status Codes:
- 200: Success
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error

## Rate Limiting

- 1000 requests per hour per user
- Rate limiting is applied to all endpoints

## Authentication

All endpoints except `/categories` and `/example-words/:category` require authentication using a JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## CORS

The API supports CORS for the following origins:
- `http://localhost:5173` (development)
- `http://127.0.0.1:5173` (development) 