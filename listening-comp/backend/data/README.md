# Data Directory

This directory contains all data files for the Italian Learning Question System.

## Directory Structure

```
data/
├── transcripts/         # Raw transcript files (.txt)
├── structured_data/     # Structured question files (.json)
├── questions/          # Processed question files (.json)
├── vector_db/         # Vector database (not tracked in git)
└── README.md          # This file
```

## Vector Database

The `vector_db/` directory contains the ChromaDB vector database files. This directory is not tracked in git and needs to be regenerated on each machine.

### Regenerating the Vector Database

To regenerate the vector database:

1. Ensure you have the required JSON files in `structured_data/`
2. Run the vector store script:
   ```bash
   python3 backend/vector_store.py
   ```

The script will:
- Initialize a new ChromaDB database in `vector_db/`
- Process all JSON files from `structured_data/`
- Create vector embeddings for questions, answers, and explanations
- Save the embeddings in the database

### Data Flow

1. Raw transcripts are saved in `transcripts/`
2. Structured data is extracted and saved as JSON in `structured_data/`
3. Questions are processed and saved in `questions/`
4. Vector embeddings are generated and stored in `vector_db/`

## Note

The `vector_db/` directory is excluded from git via `.gitignore` since:
- It contains large binary files
- It can be regenerated from source JSON files
- Different machines may use different embedding models 