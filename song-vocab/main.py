from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from core.agent import LyricsAgent

app = FastAPI(title="Italian Song Vocabulary API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Initialize the agent
agent = LyricsAgent()

class MessageRequest(BaseModel):
    message_request: str

class VocabularyWord(BaseModel):
    id: int
    italian: str
    english: str
    parts: Dict[str, str]

class Response(BaseModel):
    lyrics: str
    vocabulary: List[VocabularyWord]
    song_id: str

@app.get("/")
async def root():
    return {"message": "Welcome to Italian Song Vocabulary API"}

@app.post("/api/agent", response_model=Response)
async def get_lyrics(message_request: MessageRequest):
    try:
        # Process the request using the agent
        lyrics, vocabulary, song_id = agent.process_request(message_request.message_request)
        
        return Response(
            lyrics=lyrics,
            vocabulary=vocabulary,
            song_id=song_id
        )
    except Exception as e:
        print(f"Error processing request: {str(e)}")  # Add logging
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True) 