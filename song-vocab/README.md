# Italian Song Vocabulary API

This API extracts Italian vocabulary from song lyrics, providing translations and parts of speech for each word.

![API Documentation Interface](docs/swagger-ui.png)

The API provides a modern, interactive documentation interface powered by Swagger UI (OpenAPI 3.1). The documentation includes:
- Complete endpoint specifications
- Request/response schemas
- Interactive testing capabilities
- Validation error handling

## Installation

### Python Environment Setup

1. Install Python 3.11:
```bash
# Install pyenv if you haven't already
brew install pyenv

# Add pyenv to your shell
echo 'eval "$(pyenv init --path)"' >> ~/.zshrc
echo 'eval "$(pyenv init -)"' >> ~/.zshrc
source ~/.zshrc

# Install Python 3.11.7
pyenv install 3.11.7

# Set local Python version for the project
cd song-vocab
pyenv local 3.11.7
```

2. Create Virtual Environment:
```bash
# Create and activate virtual environment
python3.11 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create output directories
mkdir -p output/cache
```

### Ollama Setup

1. Install Ollama:
```bash
brew install ollama
```

2. Start Ollama Service:
```bash
# Start as a background service (recommended)
brew services start ollama

# Or run directly without background service
/opt/homebrew/opt/ollama/bin/ollama serve
```

3. Pull Required Model:
```bash
ollama pull mistral:7b
```

4. Verify Installation:
```bash
ollama --version
```

## Running the Application

1. Ensure Ollama service is running:
```bash
# Check if Ollama is running
brew services list | grep ollama
```

2. Start the FastAPI application:
```bash
# Make sure you're in the project directory and virtual environment is activated
cd song-vocab
source .venv/bin/activate

# Start the server
python main.py
```

The API will be available at http://127.0.0.1:8000

## API Documentation

You can access the interactive API documentation at:
- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

### Endpoints

#### 1. Root Endpoint
- **URL**: `/`
- **Method**: GET
- **Response**: Welcome message

#### 2. Agent Endpoint
- **URL**: `/api/agent`
- **Method**: POST
- **Content-Type**: application/json
- **Request Body**:
```json
{
    "message_request": "Artist Name Song Title"
}
```
- **Response**:
```json
{
    "lyrics": "Song lyrics in Italian",
    "vocabulary": [
        {
            "id": 1,
            "italian": "word",
            "english": "translation",
            "parts": {
                "type": "part_of_speech"
            }
        }
    ],
    "song_id": "artist-name-song-title"
}
```

## Example Usage

Using curl:
```bash
curl -X POST http://127.0.0.1:8000/api/agent \
  -H "Content-Type: application/json" \
  -d '{"message_request": "Eros Ramazzotti Se Bastasse Una Canzone"}'
```

Using the Swagger UI:
1. Open http://127.0.0.1:8000/docs
2. Click on the `/api/agent` endpoint
3. Click "Try it out"
4. Enter your request in the format shown above
5. Click "Execute"

## Features

- Extracts Italian vocabulary from song lyrics
- Provides English translations
- Identifies parts of speech
- Caches results for faster subsequent requests
- Stores results in SQLite database
- Interactive API documentation
- CORS enabled for cross-origin requests

## Technical Details

### Application Architecture

The application follows a modular architecture with the following components:

1. **FastAPI Server** (main.py)
   - Handles HTTP requests and responses
   - Validates request/response formats
   - Manages CORS and middleware
   - Provides API documentation

2. **LyricsAgent** (core/agent.py)
   - Main orchestrator coordinating all operations
   - Implements the ReAct framework
   - Manages caching and result storage
   - Follows a structured execution flow:
     1. Generate song ID
     2. Check cache
     3. Search for lyrics
     4. Extract content
     5. Extract vocabulary
     6. Save results

3. **Tools**
   - `search_web_serp`: Searches for song lyrics using DuckDuckGo
   - `get_page_content`: Extracts content from web pages
   - `extract_vocabulary`: Uses Mistral model to extract Italian vocabulary
   - `generate_song_id`: Creates URL-safe IDs for songs
   - `save_results`: Saves results to files and database

### Processing Flow

1. **Request Processing**:
   ```
   User Request → FastAPI → LyricsAgent → Tools → Response
   ```

2. **Lyrics Retrieval**:
   - Primary source: DuckDuckGo search for Italian lyrics
   - Fallback sources:
     - Direct Google search
     - Default lyrics websites (azlyrics.com, musixmatch.com)
   - Content extraction from web pages
   - Validation of Italian content

3. **Vocabulary Extraction**:
   - Uses Mistral 7B model via Ollama
   - Extracts:
     - Italian words
     - English translations
     - Parts of speech
     - Word IDs
   - Implements retry logic for reliability
   - Validates extracted vocabulary

4. **Error Handling**:
   - Web search fallbacks
   - Vocabulary extraction validation
   - Cache management
   - HTTP error responses
   - Logging and debugging

5. **Caching System**:
   - File-based caching in `output/cache`
   - Cache invalidation strategy
   - Performance optimization
   - Storage management

### Dependencies

- **Web Framework**: FastAPI
- **LLM**: Mistral 7B via Ollama
- **Search**: DuckDuckGo API
- **Database**: SQLite
- **Web Scraping**: BeautifulSoup
- **Documentation**: Swagger UI/OpenAPI

## Project Structure

```
song-vocab/
├── core/
│   ├── agent.py      # Main agent logic
│   └── database.py   # Database operations
├── tools/
│   ├── search_web.py         # Web search functionality
│   ├── get_page_content.py   # Web page content extraction
│   ├── extract_vocabulary.py # Vocabulary extraction
│   └── song_utils.py         # Utility functions
├── prompts/
│   └── vocabulary_extraction.md  # LLM prompt
├── output/
│   └── cache/        # Cached results
├── main.py           # FastAPI application
└── requirements.txt  # Project dependencies
```

## Troubleshooting

### Common Issues

1. **Python Version Issues**
   - Ensure you're using Python 3.11.7
   - Check version with `python --version`
   - If needed, reactivate virtual environment: `source .venv/bin/activate`

2. **Ollama Service Issues**
   - Check if service is running: `brew services list | grep ollama`
   - Restart service: `brew services restart ollama`
   - Check logs: `tail -f /opt/homebrew/var/log/ollama.log`

3. **Port Conflicts**
   - If port 8000 is in use, kill the process:
   ```bash
   lsof -i :8000
   kill -9 <PID>
   ```

### Installation Details
- Python Version: 3.11.7
- Ollama Version: 0.6.2
- Ollama Location: `/opt/homebrew/Cellar/ollama/0.6.2`
- Ollama Size: 26.2MB
- Default Ollama Port: 11434
- API Port: 8000

### Notes
- The Ollama installation includes automatic cleanup of old versions
- To disable automatic cleanup, set `HOMEBREW_NO_INSTALL_CLEANUP`
- Keep the virtual environment activated while working on the project
- The API documentation is available at http://127.0.0.1:8000/docs

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