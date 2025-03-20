from typing import List, Dict
import instructor
from ollama import Client
from pydantic import BaseModel
import hashlib
import json
import os

class VocabularyWord(BaseModel):
    id: int
    italian: str
    english: str
    parts: Dict[str, str]

class VocabularyResponse(BaseModel):
    words: List[VocabularyWord]

def get_cache_key(text: str) -> str:
    """Generate a cache key from the text content."""
    return hashlib.md5(text.encode()).hexdigest()

def get_cached_vocabulary(cache_key: str) -> List[Dict]:
    """Retrieve cached vocabulary if it exists."""
    cache_dir = "output/cache"
    os.makedirs(cache_dir, exist_ok=True)
    cache_file = f"{cache_dir}/{cache_key}.json"
    
    if os.path.exists(cache_file):
        with open(cache_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

def save_to_cache(cache_key: str, vocabulary: List[Dict]):
    """Save vocabulary to cache."""
    cache_dir = "output/cache"
    os.makedirs(cache_dir, exist_ok=True)
    cache_file = f"{cache_dir}/{cache_key}.json"
    
    with open(cache_file, 'w', encoding='utf-8') as f:
        json.dump(vocabulary, f, ensure_ascii=False, indent=2)

def load_prompt() -> str:
    """Load the vocabulary extraction prompt from file."""
    prompt_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "prompts", "vocabulary_extraction.md")
    with open(prompt_path, 'r', encoding='utf-8') as f:
        return f.read()

def extract_vocabulary(text: str) -> List[Dict]:
    """
    Extract ALL Italian vocabulary from text using Mistral model.
    Uses caching to avoid repeated API calls for the same text.
    
    Args:
        text (str): Text to extract vocabulary from
        
    Returns:
        List[Dict]: List of vocabulary words with structure matching database schema
    """
    # Check cache first
    cache_key = get_cache_key(text)
    cached_result = get_cached_vocabulary(cache_key)
    if cached_result:
        return cached_result
    
    # If not in cache, make API call
    client = Client()
    ollama_client = instructor.from_openai(
        client.chat,
        model="mistral:7b",
        mode=instructor.Mode.JSON
    )
    
    # Load and format prompt
    prompt_template = load_prompt()
    prompt = prompt_template.format(text=text)
    
    # Make API call with retries to ensure complete vocabulary extraction
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = ollama_client.chat(
                messages=[{"role": "user", "content": prompt}],
                response_model=VocabularyResponse
            )
            
            vocabulary = [word.dict() for word in response.words]
            
            # Verify we have all words by checking for gaps in IDs
            ids = [word["id"] for word in vocabulary]
            if len(ids) > 0 and max(ids) != len(ids):
                raise ValueError("Missing vocabulary entries detected")
            
            # Save to cache
            save_to_cache(cache_key, vocabulary)
            
            return vocabulary
            
        except Exception as e:
            if attempt == max_retries - 1:
                raise Exception(f"Failed to extract complete vocabulary after {max_retries} attempts: {str(e)}")
            continue