# Tech Specs

## Business Goal
We aim to develop a program that retrieves song lyrics from the internet in Italian and extracts vocabulary to be imported into our database.

## Technical Requirements

- **FastAPI**
- **Ollama** via the **Ollama Python SDK**  
  - **Mistral 7B**
- **Instructor** (for structured JSON output)
- **SQLite3** (for the database)
- **duckduckgo-search** (to search for lyrics)

## API Endpoints

### `POST /api/agent` - GetLyrics  

#### Behaviour

This endpoint interacts with our agent, which utilises the **ReAct** framework. The agent searches the internet for multiple possible versions of the song lyrics, selects the correct version, and extracts relevant vocabulary.

#### Available Tools:
- `tools/extract_vocabulary.py`
- `tools/get_page_content.py`
- `tools/search_web.py`

### JSON Request Parameters
- **`message_request`** (`string`): A string describing the song and/or artist to fetch lyrics from the internet.

### JSON Response
- **`lyrics`** (`string`): The retrieved song lyrics.
- **`vocabulary`** (`list`): A list of vocabulary words extracted from the lyrics.