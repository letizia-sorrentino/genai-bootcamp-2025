import os
from typing import List, Dict, Optional
import chromadb
from chromadb.config import Settings
import json
import re

class QuestionVectorStore:
    def __init__(self, collection_name: str = "italian_lessons"):
        """
        Initialize a vector database for storing and searching Italian lesson questions.
        Uses ChromaDB as the underlying vector store, which:
        1. Converts text into vector embeddings
        2. Stores these embeddings in a persistent database
        3. Enables semantic search across the embeddings
        
        Args:
            collection_name (str): Name of the vector database collection
        """
        # Set up paths
        self.backend_dir = os.path.dirname(os.path.abspath(__file__))
        self.data_dir = os.path.join(self.backend_dir, "data")
        self.structured_data_dir = os.path.join(self.data_dir, "structured_data")
        self.vector_db_dir = os.path.join(self.data_dir, "vector_db")
        
        # Create vector database directory
        os.makedirs(self.vector_db_dir, exist_ok=True)
        
        # Initialize the vector database with ChromaDB
        try:
            self.client = chromadb.PersistentClient(
                path=self.vector_db_dir
            )
            print(f"ChromaDB initialized with persistence at: {self.vector_db_dir}")
        except Exception as e:
            print(f"Error initializing ChromaDB: {str(e)}")
            raise
        
        # Get or create a collection in the vector database
        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            metadata={"description": "Vector embeddings of Italian lesson questions for semantic search"}
        )
    
    def parse_questions_from_file(self, file_path: str) -> Dict:
        """
        Parse questions from a JSON file.
        
        Args:
            file_path (str): Path to the JSON file
            
        Returns:
            Dict: Parsed data containing introduction and questions
        """
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        # Validate required structure
        if not isinstance(data, dict) or 'questions' not in data:
            raise ValueError("Invalid JSON format: must contain 'questions' array")
            
        # Ensure questions have required fields
        for q in data.get('questions', []):
            required_fields = ['number', 'question', 'options', 'answer', 'explanation']
            if not all(field in q for field in required_fields):
                raise ValueError(f"Question missing required fields: {required_fields}")
            
            if not isinstance(q['options'], list) or len(q['options']) != 3:
                raise ValueError("Each question must have exactly 3 options")
        
        return data
    
    def save_questions_to_json(self, questions: List[Dict], video_id: str, section_num: int) -> str:
        """
        Save questions to a JSON file.
        
        Args:
            questions (List[Dict]): List of question dictionaries
            video_id (str): Video ID
            section_num (int): Section number
            
        Returns:
            str: Path to the saved JSON file
        """
        output_dir = os.path.join(self.data_dir, "questions")
        os.makedirs(output_dir, exist_ok=True)
        
        # Format data for JSON
        data = {
            'video_id': video_id,
            'section_num': section_num,
            'questions': questions
        }
        
        # Save to file
        output_path = os.path.join(output_dir, f"{video_id}_s{section_num}_questions.json")
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            
        return output_path
    
    def add_questions(self, section_num: int, questions: List[Dict], video_id: str) -> bool:
        """
        Add questions to the vector database.
        
        Args:
            section_num (int): Section number for the questions
            questions (List[Dict]): List of question dictionaries
            video_id (str): Video ID these questions belong to
            
        Returns:
            bool: True if questions were added successfully
        """
        try:
            documents = []  # Text to be embedded
            metadatas = []  # Metadata for each embedding
            ids = []       # Unique IDs for each embedding
            
            # Add questions, answers, and explanations to vector database
            for q in questions:
                # Generate unique question ID
                question_id = f"{video_id}_s{section_num}_q{q['number']}"
                
                # Create a rich text representation for better semantic search
                search_text = f"Question: {q['question']}\nExplanation: {q['explanation']}"
                documents.append(search_text)
                metadatas.append({
                    'type': 'question',
                    'number': q['number'],
                    'section_num': section_num,
                    'video_id': video_id,
                    'question_id': question_id,
                    'options': ','.join(q['options'])
                })
                ids.append(f"{question_id}_q")
                
                # Add answer embedding
                documents.append(q['answer'])
                metadatas.append({
                    'type': 'answer',
                    'number': q['number'],
                    'section_num': section_num,
                    'video_id': video_id,
                    'question_id': question_id
                })
                ids.append(f"{question_id}_a")
                
                # Add explanation embedding
                documents.append(q['explanation'])
                metadatas.append({
                    'type': 'explanation',
                    'number': q['number'],
                    'section_num': section_num,
                    'video_id': video_id,
                    'question_id': question_id
                })
                ids.append(f"{question_id}_e")
            
            # Add all documents to the vector database
            if documents:
                self.collection.add(
                    documents=documents,  # Text to be converted to vectors
                    metadatas=metadatas,  # Metadata for each vector
                    ids=ids              # Unique IDs for each vector
                )
                print(f"Added {len(documents)} vector embeddings for section {section_num}")
                return True
            else:
                print(f"No questions to add for section {section_num}")
                return False
            
        except Exception as e:
            print(f"Error adding questions: {str(e)}")
            return False
    
    def get_question_by_id(self, section_num: int, question_id: str) -> Optional[Dict]:
        """
        Retrieve a specific question by its ID and section number.
        
        Args:
            section_num (int): Section number to search in
            question_id (str): Unique question ID
            
        Returns:
            Optional[Dict]: Question data if found, None otherwise
        """
        try:
            # Query the vector database for the question
            results = self.collection.query(
                query_texts=[""],  # Empty query to get exact matches
                where={"$and": [
                    {"section_num": section_num},
                    {"question_id": question_id},
                    {"type": "question"}
                ]}
            )
            
            if not results['documents'][0]:
                return None
            
            # Get metadata from the matched question
            metadata = results['metadatas'][0][0]
            options = metadata['options'].split(',')
            
            # Query for answer and explanation
            answer_results = self.collection.query(
                query_texts=[""],
                where={"$and": [
                    {"question_id": question_id},
                    {"type": "answer"}
                ]}
            )
            
            explanation_results = self.collection.query(
                query_texts=[""],
                where={"$and": [
                    {"question_id": question_id},
                    {"type": "explanation"}
                ]}
            )
            
            # Combine all components
            return {
                'question_id': question_id,
                'section_num': section_num,
                'number': metadata['number'],
                'video_id': metadata['video_id'],
                'question': results['documents'][0][0].split('Question: ')[1].split('\n')[0],
                'options': options,
                'answer': answer_results['documents'][0][0] if answer_results['documents'][0] else '',
                'explanation': explanation_results['documents'][0][0] if explanation_results['documents'][0] else ''
            }
            
        except Exception as e:
            print(f"Error getting question {question_id}: {str(e)}")
            return None
    
    def search_similar_questions(self, section_num: int, query: str, n_results: int = 5) -> List[Dict]:
        """
        Search for questions semantically similar to the query within a section.
        
        Args:
            section_num (int): Section number to search in
            query (str): The search query
            n_results (int): Maximum number of results to return
            
        Returns:
            List[Dict]: List of matching questions with their similarity scores
        """
        try:
            # Query the vector database
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results * 2,  # Get more results initially for filtering
                where={"$and": [
                    {"section_num": section_num},
                    {"type": "question"}
                ]}
            )
            
            if not results['documents'][0]:
                print("No matching questions found")
                return []
            
            formatted_results = []
            for i, doc in enumerate(results['documents'][0]):
                metadata = results['metadatas'][0][i]
                distance = float(results['distances'][0][i])
                
                # Calculate similarity score (0 to 1)
                if distance > 2.0:  # Too dissimilar
                    continue
                    
                similarity = max(0, min(1, 1 - (distance / 2.0)))
                if similarity < 0.1:  # Filter out low similarity results
                    continue
                
                # Get full question data
                question_data = self.get_question_by_id(
                    section_num,
                    metadata['question_id']
                )
                
                if question_data:
                    formatted_results.append({
                        'question': question_data.get('question', ''),
                        'options': question_data.get('options', []),
                        'answer': question_data.get('answer', ''),
                        'explanation': question_data.get('explanation', ''),
                        'number': metadata['number'],
                        'video_id': metadata['video_id'],
                        'question_id': metadata['question_id'],
                        'similarity': f"{similarity * 100:.1f}%"
                    })
            
            # Sort by similarity and limit to n_results
            formatted_results.sort(key=lambda x: float(x['similarity'].rstrip('%')), reverse=True)
            return formatted_results[:n_results]
            
        except Exception as e:
            print(f"Error searching questions: {str(e)}")
            return []
    
    def index_questions_file(self, file_path: str, section_num: int) -> bool:
        """
        Parse and index questions from a JSON file.
        
        Args:
            file_path (str): Path to the JSON file
            section_num (int): Section number for these questions
            
        Returns:
            bool: True if indexing was successful
        """
        try:
            # Extract video ID from filename
            video_id = os.path.basename(file_path).split('_')[0]  # Get first part before underscore
            
            # Parse questions from file
            data = self.parse_questions_from_file(file_path)
            
            # Save structured format to JSON
            self.save_questions_to_json(data['questions'], video_id, section_num)
            
            # Add questions to vector database
            if data['questions']:
                return self.add_questions(section_num, data['questions'], video_id)
            else:
                print(f"No questions found in {file_path}")
                return False
                
        except Exception as e:
            print(f"Error indexing file {file_path}: {str(e)}")
            return False
    
    def inspect_database(self) -> None:
        """Display the contents of the vector database"""
        try:
            # Get all items from the collection
            results = self.collection.get()
            
            if not results['documents']:
                print("Vector database is empty")
                return
            
            print("\nVector Database Contents:")
            print("========================")
            print(f"Total Entries: {len(results['documents'])}")
            
            # Count entries by type
            type_counts = {}
            for metadata in results['metadatas']:
                entry_type = metadata['type']
                type_counts[entry_type] = type_counts.get(entry_type, 0) + 1
            
            print("\nEntries by Type:")
            for entry_type, count in type_counts.items():
                print(f"- {entry_type}: {count} entries")
            
            # Group by video_id
            video_questions = {}
            for i, metadata in enumerate(results['metadatas']):
                if metadata['type'] == 'question':
                    video_id = metadata['video_id']
                    if video_id not in video_questions:
                        video_questions[video_id] = []
                    video_questions[video_id].append({
                        'number': metadata['number'],
                        'text': results['documents'][i].split('Question: ')[1].split('\n')[0]
                    })
            
            print("\nQuestions by Video:")
            for video_id, questions in video_questions.items():
                print(f"\nVideo {video_id}:")
                for q in sorted(questions, key=lambda x: x['number']):
                    print(f"  Question {q['number']}: {q['text'][:100]}...")
                    
        except Exception as e:
            print(f"Error inspecting database: {str(e)}")

if __name__ == "__main__":
    # Initialize the vector database
    store = QuestionVectorStore()
    
    # Process all JSON files and add them to the vector database
    structured_data_dir = os.path.join(store.data_dir, "structured_data")
    if not os.path.exists(structured_data_dir):
        print(f"Error: Structured data directory {structured_data_dir} does not exist")
        exit(1)
    
    # Find JSON files to process
    files = [f for f in os.listdir(structured_data_dir) if f.endswith('.json')]
    print(f"Found {len(files)} JSON files to add to vector database: {files}")
    
    # Add files to vector database
    processed = 0
    for file in files:
        file_path = os.path.join(structured_data_dir, file)
        if store.index_questions_file(file_path, 1):
            processed += 1
    
    print(f"\nSuccessfully added {processed} files to vector database")
    
    # Display database contents
    store.inspect_database()
    
    # Test vector similarity search
    print("\nTesting vector similarity search:")
    test_queries = [
        "How do I use prepositions with cities?",
        "Tell me about verb conjugation",
        "What are the rules for articles?"
    ]
    
    for query in test_queries:
        print(f"\nQuery: {query}")
        results = store.search_similar_questions(1, query)
        for r in results:
            print(f"\nQuestion {r['number']} from video {r['video_id']} (Similarity: {r['similarity']}):")
            print(f"Q: {r['question']}")
            print(f"A: {r['answer']}")
            print(f"E: {r['explanation']}")
