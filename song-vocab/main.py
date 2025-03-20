from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
from datetime import datetime, timedelta
from collections import defaultdict
from core.agent import LyricsAgent

app = FastAPI(title="Italian Song Vocabulary API")

# Rate limiting configuration
RATE_LIMIT = 10  # requests per minute
rate_limit_dict = defaultdict(list)

# Initialize the agent
agent = LyricsAgent()

class MessageRequest(BaseModel):
    message_request: str

class Response(BaseModel):
    lyrics: str
    vocabulary: List[Dict[str, any]]  # List of words with id, italian, english, and parts fields
    song_id: str

def check_rate_limit(request: Request) -> bool:
    """Check if the request is within rate limits."""
    client_ip = request.client.host
    current_time = datetime.now()
    
    # Clean old requests
    rate_limit_dict[client_ip] = [
        req_time for req_time in rate_limit_dict[client_ip]
        if current_time - req_time < timedelta(minutes=1)
    ]
    
    # Check if limit exceeded
    if len(rate_limit_dict[client_ip]) >= RATE_LIMIT:
        return False
    
    # Add current request
    rate_limit_dict[client_ip].append(current_time)
    return True

@app.post("/api/agent", response_model=Response)
async def get_lyrics(request: Request, message_request: MessageRequest):
    # Check rate limit
    if not check_rate_limit(request):
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please try again in a minute."
        )
    
    try:
        # Process the request using the agent
        lyrics, vocabulary, song_id = agent.process_request(message_request.message_request)
        
        return Response(
            lyrics=lyrics,
            vocabulary=vocabulary,
            song_id=song_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 