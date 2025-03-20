# Italian Song Vocabulary Extractor

A FastAPI application that extracts Italian vocabulary from song lyrics. The application follows a ReAct framework to search for Italian songs, extract their lyrics, and generate a structured vocabulary list with translations.

## Features

- 🔍 Search for Italian song lyrics using SERP API
- 📝 Extract full lyrics from web pages
- 📚 Generate comprehensive vocabulary lists with:
  - Italian words
  - English translations
  - Parts of speech
  - Word types
- 💾 Save results in both text and JSON formats
- 🗄️ SQLite database for persistent storage
- 🚀 Rate-limited API endpoints
- 🔄 Caching for efficient vocabulary extraction

## Project Structure

```
song-vocab/
├── main.py              # FastAPI application entry point
├── core/               # Core application components
│   ├── __init__.py
│   ├── agent.py        # ReAct framework implementation
│   └── database.py     # Database operations
├── tools/              # Utility tools
│   ├── __init__.py
│   ├── search_web.py   # Web search functionality
│   ├── get_page_content.py  # Web page content extraction
│   ├── extract_vocabulary.py  # Vocabulary extraction
│   └── song_utils.py   # File operations and song ID generation
├── prompts/            # LLM prompts
│   ├── lyrics_agent.md # Main agent prompt
│   └── vocabulary_extraction.md  # Vocabulary extraction prompt
├── output/            # Generated content
│   ├── cache/        # Cached vocabulary results
│   ├── *_lyrics.txt  # Song lyrics files
│   └── *_vocabulary.json  # Vocabulary JSON files
└── requirements.txt   # Python dependencies
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd song-vocab
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the Ollama service (required for LLM functionality):
```bash
ollama serve
```

5. Run the application:
```bash
python main.py
```

## API Usage

### Endpoint: POST /api/agent

Search for an Italian song and extract its vocabulary.

**Request:**
```json
{
    "message_request": "Eros Ramazzotti Se Bastasse Una Canzone"
}
```

**Response:**
```json
{
    "lyrics": "Se bastasse una canzone...",
    "vocabulary": [
        {
            "id": 1,
            "italian": "se",
            "english": "if",
            "parts": {"type": "conjunction"}
        },
        {
            "id": 2,
            "italian": "bastasse",
            "english": "were enough",
            "parts": {"type": "verb"}
        }
    ],
    "song_id": "eros-ramazzotti-se-bastasse-una-canzone"
}
```

## Data Storage

### File Storage
For each song, two files are generated in the `output` directory:
1. `{song_id}_lyrics.txt`: Contains the full song lyrics
2. `{song_id}_vocabulary.json`: Contains the structured vocabulary list

### Database Storage
The application uses SQLite for persistent storage with the following schema:
- `songs`: Stores song information (title, artist, song_id)
- `vocabulary`: Stores vocabulary words with translations and parts of speech
- `word_groups`: Categories for vocabulary (e.g., "Basic Vocabulary", "Food and Drinks")
- `vocabulary_word_groups`: Links vocabulary words to groups

## Rate Limiting

The API is rate-limited to 10 requests per minute per IP address. When the limit is exceeded, a 429 status code is returned.

## Caching

Vocabulary extraction results are cached to improve performance and reduce API calls. Cache files are stored in the `output/cache` directory.

## Development

### Project Organization
- `core/`: Contains the main application logic
  - `agent.py`: Implements the ReAct framework
  - `database.py`: Handles database operations
- `tools/`: Contains utility functions and external service integrations
- `prompts/`: Contains LLM prompts for different tasks
- `output/`: Contains generated content and cache

### Adding New Features
1. Create new tools in the `tools/` directory
2. Update the `LyricsAgent` class in `core/agent.py` to use new tools
3. Add new prompts in the `prompts/` directory if needed
4. Update the database schema in `core/database.py` if required

### Testing

Run tests using pytest:
```bash
pytest
```

## License

MIT License - see LICENSE file for details 