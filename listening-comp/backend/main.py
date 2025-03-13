from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, List
from backend.rag import RAGQuestionGenerator
from backend.question_store import QuestionStore

app = FastAPI(title="Italian Learning Question Generator")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
question_generator = RAGQuestionGenerator()
question_store = QuestionStore()

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
    
    # Add topic to question data
    question['topic'] = request.topic
    
    # Save the generated question
    question_id = question_store.add_question(question)
    question['id'] = question_id
    
    return question

@app.get("/api/stored-questions")
async def get_stored_questions() -> List[Dict]:
    """Get all questions stored in the vector store"""
    try:
        # Get questions from vector store
        questions = question_generator.vector_store.get_all_questions()
        return questions
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch stored questions: {str(e)}"
        )

@app.get("/api/practice-questions")
async def get_practice_questions(topic: Optional[str] = None) -> List[Dict]:
    """Get all saved practice questions, optionally filtered by topic"""
    return question_store.get_questions(topic)

@app.get("/api/practice-questions/{question_id}")
async def get_practice_question(question_id: str) -> Dict:
    """Get a specific practice question by ID"""
    question = question_store.get_question(question_id)
    if not question:
        raise HTTPException(
            status_code=404,
            detail="Question not found"
        )
    return question

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 