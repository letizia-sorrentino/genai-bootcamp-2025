from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict
from rag import RAGQuestionGenerator

app = FastAPI(title="Italian Learning Question Generator")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG generator
question_generator = RAGQuestionGenerator()

class QuestionRequest(BaseModel):
    topic: str
    section_num: Optional[int] = 1

@app.post("/api/generate-question")
async def generate_question(request: QuestionRequest) -> Dict:
    """Generate a new Italian language question about the given topic"""
    question = await question_generator.generate_question(
        topic=request.topic,
        section_num=request.section_num
    )
    
    if not question:
        raise HTTPException(
            status_code=400,
            detail="Failed to generate question. Please try a different topic."
        )
    
    return question

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 