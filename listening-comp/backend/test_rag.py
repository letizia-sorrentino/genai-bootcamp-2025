import asyncio
import json
from rag import RAGQuestionGenerator
import traceback
from vector_store import QuestionVectorStore

async def test_question_generation():
    try:
        # First, let's inspect what's in our vector store
        print("Inspecting Vector Store Contents...")
        vector_store = QuestionVectorStore()
        vector_store.inspect_database()
        
        print("\nTesting similar question retrieval...")
        # Test getting similar questions directly
        test_topics = [
            "verb conjugation",
            "prepositions with cities",
            "definite articles"
        ]
        
        for topic in test_topics:
            print(f"\nSearching for questions about: {topic}")
            similar = vector_store.search_similar_questions(1, topic, n_results=2)
            if similar:
                print(f"Found {len(similar)} similar questions:")
                for q in similar:
                    print(f"- {q['question']}")
                    print(f"  Similarity: {q['similarity']}")
            else:
                print("No similar questions found")
        
        # Now test the RAG generator
        print("\nInitializing RAG Question Generator...")
        generator = RAGQuestionGenerator()
        
        print("\nTesting RAG Question Generator with Nova Lite\n")
        print("=" * 50)
        
        # Test with just one topic first
        topic = "verb conjugation"
        try:
            print(f"\nGenerating question about: {topic}")
            print("-" * 30)
            
            # Generate question
            print("Calling generate_question...")
            question = await generator.generate_question(topic)
            
            if question:
                print("\nGenerated Question:")
                print(f"Q: {question['question']}")
                print("\nOptions:")
                for i, opt in enumerate(question['options'], 1):
                    print(f"{i}. {opt}")
                print(f"\nCorrect Answer: {question['answer']}")
                print(f"Explanation: {question['explanation']}")
            else:
                print(f"Failed to generate question for topic: {topic}")
            
        except Exception as e:
            print(f"Error processing topic '{topic}':")
            print(traceback.format_exc())
            
    except Exception as e:
        print("Error in test script:")
        print(traceback.format_exc())

if __name__ == "__main__":
    asyncio.run(test_question_generation()) 