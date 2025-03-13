import json
import os
from typing import Dict, List, Optional
from datetime import datetime

class QuestionStore:
    def __init__(self):
        """Initialize the question store"""
        self.store_dir = os.path.join(os.path.dirname(__file__), 'data', 'saved_questions')
        os.makedirs(self.store_dir, exist_ok=True)
        self.questions_file = os.path.join(self.store_dir, 'questions.json')
        
        # Fallback questions to use when no generated questions are available
        self.fallback_questions = [
            {
                "id": "fallback_1",
                "timestamp": "2024-03-11T16:00:00",
                "topic": "adjective agreement",
                "number": 1,
                "question": "Qual è il plurale di 'bella' e 'interessante'?",
                "options": [
                    "belle e interessanti",
                    "bella e interessante",
                    "belli e interessanti"
                ],
                "answer": "belle e interessanti",
                "explanation": "The noun 'donne' is feminine plural, so the adjective must also be in the feminine plural form."
            },
            {
                "id": "fallback_2",
                "timestamp": "2024-03-11T16:00:00",
                "topic": "verb conjugation",
                "number": 2,
                "question": "Qual è la coniugazione corretta del verbo 'costruire' se il soggetto è 'loro'?",
                "options": [
                    "costruisco",
                    "costruiscono",
                    "costruiamo"
                ],
                "answer": "costruiscono",
                "explanation": "We need to use the third plural person 'loro' of the present tense of the verb 'costruire'."
            }
        ]
        
        self._load_questions()

    def _load_questions(self):
        """Load questions from file"""
        if os.path.exists(self.questions_file):
            with open(self.questions_file, 'r') as f:
                self.questions = json.load(f)
        else:
            self.questions = []
            self._save_questions()

    def _save_questions(self):
        """Save questions to file"""
        with open(self.questions_file, 'w') as f:
            json.dump(self.questions, f, indent=2)

    def add_question(self, question: Dict) -> str:
        """Add a new question to the store"""
        question_id = str(len(self.questions) + 1)
        stored_question = {
            'id': question_id,
            'timestamp': datetime.now().isoformat(),
            'topic': question.get('topic', 'general'),
            **question
        }
        self.questions.append(stored_question)
        self._save_questions()
        return question_id

    def get_questions(self, topic: Optional[str] = None) -> List[Dict]:
        """Get all questions, optionally filtered by topic"""
        # Start with generated questions
        questions = self.questions.copy()  # Make a copy to avoid modifying the original list
        
        # Add fallback questions only if there are no generated questions
        if not questions:
            questions.extend(self.fallback_questions)
            
        # Filter by topic if specified
        if topic:
            return [q for q in questions if q.get('topic') == topic]
        return questions

    def get_question(self, question_id: str) -> Optional[Dict]:
        """Get a specific question by ID"""
        # Check generated questions first
        for question in self.questions:
            if question['id'] == question_id:
                return question
                
        # Then check fallback questions
        for question in self.fallback_questions:
            if question['id'] == question_id:
                return question
                
        return None 