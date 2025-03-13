import json
from typing import Dict, List, Optional
import boto3
from backend.vector_store import QuestionVectorStore

class RAGQuestionGenerator:
    def __init__(self):
        """Initialize the RAG question generator with vector store and Bedrock client"""
        self.vector_store = QuestionVectorStore()
        self.bedrock = boto3.client('bedrock-runtime')
        
    def _get_similar_questions(self, topic: str, section_num: int = 1, n_results: int = 3) -> List[Dict]:
        """Get similar questions from the vector store"""
        # Limit n_results to 3 since we only need a few examples for context
        return self.vector_store.search_similar_questions(section_num, topic, min(n_results, 3))
    
    def _format_context(self, similar_questions: List[Dict]) -> str:
        """Format similar questions into context for the LLM"""
        context = "Here are some example Italian language questions:\n\n"
        for i, q in enumerate(similar_questions, 1):
            context += f"Example {i}:\n"
            context += f"Question: {q['question']}\n"
            context += f"Options:\n"
            for opt in q['options']:
                context += f"- {opt}\n"
            context += f"Answer: {q['answer']}\n"
            context += f"Explanation: {q['explanation']}\n\n"
        return context
    
    def _generate_prompt(self, topic: str, context: str) -> str:
        """Create the prompt for the LLM"""
        return f"""You are an expert Italian language teacher. Using the example questions below as inspiration, 
create a new multiple-choice question about {topic}. The question should:
1. Be in Italian
2. Have exactly 3 options
3. Include the correct answer
4. Provide a clear explanation in English

Example questions for reference:
{context}

Generate a new question following the same format but about {topic}. Make it different from the examples 
but maintain a similar style and difficulty level.

Format your response as a JSON object with these fields:
- question: the question text in Italian
- options: array of 3 possible answers in Italian
- answer: the correct answer in Italian
- explanation: explanation in English why this is correct

Only respond with the JSON object, no other text."""

    def _invoke_bedrock(self, prompt: str) -> Optional[str]:
        """Invoke Bedrock with the given prompt"""
        try:
            response = self.bedrock.invoke_model(
                modelId='amazon.nova-lite-v1:0',
                contentType='application/json',
                accept='application/json',
                body=json.dumps({
                    "inferenceConfig": {
                        "max_new_tokens": 1000
                    },
                    "messages": [{
                        "role": "user",
                        "content": [{
                            "text": prompt
                        }]
                    }]
                })
            )
            
            response_body = json.loads(response['body'].read())
            return response_body['output']['message']['content'][0]['text']
        except Exception as e:
            print(f"Error invoking Bedrock: {str(e)}")
            return None

    async def generate_question(self, topic: str, section_num: int = 1) -> Optional[Dict]:
        """Generate a new question about the given topic using RAG"""
        try:
            # Get similar questions for context
            similar_questions = self._get_similar_questions(topic, section_num)
            if not similar_questions:
                return None
                
            # Format context and create prompt
            context = self._format_context(similar_questions)
            prompt = self._generate_prompt(topic, context)
            
            # Get response from Bedrock
            generated_text = self._invoke_bedrock(prompt)
            if not generated_text:
                return None
            
            # Extract JSON from response
            try:
                # Find JSON block in response
                json_start = generated_text.find('{')
                json_end = generated_text.rfind('}') + 1
                if json_start == -1 or json_end == 0:
                    return None
                    
                json_str = generated_text[json_start:json_end]
                question_data = json.loads(json_str)
                
                # Validate required fields
                required_fields = ['question', 'options', 'answer', 'explanation']
                if not all(field in question_data for field in required_fields):
                    return None
                    
                if not isinstance(question_data['options'], list) or len(question_data['options']) != 3:
                    return None
                    
                return question_data
                
            except json.JSONDecodeError:
                return None
                
        except Exception as e:
            print(f"Error generating question: {str(e)}")
            return None
