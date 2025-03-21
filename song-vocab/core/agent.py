from typing import List, Dict, Tuple
import os
import json
from tools.search_web import search_web_serp
from tools.get_page_content import get_page_content
from tools.extract_vocabulary import extract_vocabulary
from tools.song_utils import generate_song_id, save_results

def load_prompt() -> str:
    """Load the lyrics agent prompt template"""
    prompt_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "prompts",
        "lyrics_agent.md"
    )
    with open(prompt_path, 'r', encoding='utf-8') as f:
        return f.read()

class LyricsAgent:
    def __init__(self):
        self.tools = {
            "search_web_serp": search_web_serp,
            "get_page_content": get_page_content,
            "extract_vocabulary": extract_vocabulary,
            "generate_song_id": generate_song_id,
            "save_results": save_results
        }
        self.cache_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "output", "cache")
        os.makedirs(self.cache_dir, exist_ok=True)
        self.prompt = load_prompt()

    def _get_cache_path(self, song_id: str) -> str:
        return os.path.join(self.cache_dir, f"{song_id}.json")

    def _load_from_cache(self, song_id: str) -> Tuple[str, List[Dict], str]:
        cache_path = self._get_cache_path(song_id)
        if os.path.exists(cache_path):
            with open(cache_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data['lyrics'], data['vocabulary'], song_id
        return None

    def _save_to_cache(self, song_id: str, lyrics: str, vocabulary: List[Dict]):
        cache_path = self._get_cache_path(song_id)
        with open(cache_path, 'w', encoding='utf-8') as f:
            json.dump({
                'lyrics': lyrics,
                'vocabulary': vocabulary
            }, f, ensure_ascii=False, indent=2)

    def process_request(self, query: str) -> Tuple[str, List[Dict], str]:
        """
        Process a request following the ReAct framework and the agent prompt.
        
        Args:
            query (str): The song query (e.g., "Eros Ramazzotti Se Bastasse Una Canzone")
            
        Returns:
            Tuple[str, List[Dict], str]: (lyrics, vocabulary, song_id)
        """
        # Generate song ID first to check cache
        song_id = self.tools["generate_song_id"](query)
        
        # Try to load from cache
        cached_result = self._load_from_cache(song_id)
        if cached_result:
            print("Found in cache, returning cached result")
            return cached_result

        # Format the prompt with the query
        formatted_prompt = self.prompt.format(query=query)
        
        # Follow the execution flow from the prompt
        print("Thought: I need to search for the song lyrics first. Let me try SERP API.")
        search_results = self.tools["search_web_serp"](query)
        
        print("Thought: Got search results. Now I need to extract the content.")
        lyrics = self.tools["get_page_content"](search_results[0])
        
        print("Thought: Now I'll extract the vocabulary from the lyrics.")
        vocabulary = self.tools["extract_vocabulary"](lyrics)
        
        # Save results
        print("Thought: Saving the results to files and cache.")
        self.tools["save_results"](song_id, lyrics, vocabulary)
        self._save_to_cache(song_id, lyrics, vocabulary)
        
        print("FINISHED")
        return lyrics, vocabulary, song_id 