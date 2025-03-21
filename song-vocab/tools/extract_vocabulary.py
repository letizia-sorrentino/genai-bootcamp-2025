from typing import List, Dict
import hashlib
import json
import os
from ollama import Client
import instructor
from pydantic import BaseModel

class Word(BaseModel):
    id: int
    italian: str
    english: str
    parts: Dict[str, str]

class VocabularyResponse(BaseModel):
    words: List[Word]

def get_cache_key(text: str) -> str:
    """Generate a cache key from text"""
    return hashlib.md5(text.encode()).hexdigest()

def get_cache_path(cache_key: str) -> str:
    """Get the full path to a cache file"""
    cache_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "output", "cache")
    return os.path.join(cache_dir, f"{cache_key}.json")

def get_cached_vocabulary(cache_key: str) -> List[Dict]:
    """Get vocabulary from cache if it exists"""
    cache_path = get_cache_path(cache_key)
    if os.path.exists(cache_path):
        with open(cache_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

def save_to_cache(cache_key: str, vocabulary: List[Dict]):
    """Save vocabulary to cache"""
    cache_path = get_cache_path(cache_key)
    with open(cache_path, 'w', encoding='utf-8') as f:
        json.dump(vocabulary, f, ensure_ascii=False, indent=2)

def load_prompt() -> str:
    """Load the vocabulary extraction prompt template"""
    prompt_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "prompts",
        "vocabulary_extraction.md"
    )
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
    
    # Load and format prompt
    prompt_template = load_prompt()
    prompt = prompt_template.format(text=text)
    
    # Make API call with retries to ensure complete vocabulary extraction
    max_retries = 3
    for attempt in range(max_retries):
        try:
            # Get response from Ollama
            response = client.chat(
                model="mistral:7b",
                messages=[{
                    "role": "system",
                    "content": "You are a helpful assistant that extracts Italian vocabulary from text and returns it in JSON format."
                }, {
                    "role": "user",
                    "content": prompt
                }],
                format="json"  # Request JSON output
            )
            
            # Parse the response text into our expected format
            response_text = response['message']['content']
            print(f"Raw response: {response_text}")  # Debug logging
            
            try:
                # Try to parse as JSON
                response_json = json.loads(response_text)
                
                # Ensure we have the words array
                if not isinstance(response_json, dict) or "words" not in response_json:
                    response_json = {"words": []}
                
                words = response_json["words"]
                if not isinstance(words, list):
                    words = []
                
                # Validate each word has required fields
                vocabulary = []
                for word in words:
                    if isinstance(word, dict) and all(k in word for k in ["id", "italian", "english", "parts"]):
                        vocabulary.append({
                            "id": word["id"],
                            "italian": word["italian"],
                            "english": word["english"],
                            "parts": word["parts"]
                        })
                
                if vocabulary:
                    # Save to cache
                    save_to_cache(cache_key, vocabulary)
                    return vocabulary
                    
            except json.JSONDecodeError as je:
                print(f"JSON parsing error: {str(je)}")
                if attempt == max_retries - 1:
                    raise Exception(f"Failed to parse model response as JSON: {str(je)}")
                continue
                
        except Exception as e:
            print(f"Attempt {attempt + 1} failed: {str(e)}")
            if attempt == max_retries - 1:
                raise Exception(f"Failed to extract vocabulary after {max_retries} attempts: {str(e)}")
            continue
            
    raise Exception("Failed to extract vocabulary: no valid response received")