from typing import List, Dict, Tuple
from tools.search_web import search_web_serp
from tools.get_page_content import get_page_content
from tools.extract_vocabulary import extract_vocabulary
from tools.song_utils import generate_song_id, save_results

class LyricsAgent:
    def __init__(self):
        self.tools = {
            "search_web_serp": search_web_serp,
            "get_page_content": get_page_content,
            "extract_vocabulary": extract_vocabulary,
            "generate_song_id": generate_song_id,
            "save_results": save_results
        }

    def process_request(self, query: str) -> Tuple[str, List[Dict], str]:
        """
        Process a request following the ReAct framework:
        1. Search for lyrics
        2. Get content
        3. Extract vocabulary
        4. Generate song ID
        5. Save results
        
        Args:
            query (str): The song query (e.g., "Eros Ramazzotti Se Bastasse Una Canzone")
            
        Returns:
            Tuple[str, List[Dict], str]: (lyrics, vocabulary, song_id)
        """
        # Step 1: Search for lyrics
        print("Thought: I need to search for the song lyrics first. Let me try SERP API.")
        search_results = self.tools["search_web_serp"](query)
        
        # Step 2: Get content
        print("Thought: Got search results. Now I need to extract the content.")
        lyrics = self.tools["get_page_content"](search_results[0])
        
        # Step 3: Extract vocabulary
        print("Thought: Now I'll extract the vocabulary from the lyrics.")
        vocabulary = self.tools["extract_vocabulary"](lyrics)
        
        # Step 4: Generate song ID
        print("Thought: Generating a unique ID for this song.")
        song_id = self.tools["generate_song_id"](query)
        
        # Step 5: Save results
        print("Thought: Saving the results to files.")
        self.tools["save_results"](song_id, lyrics, vocabulary)
        
        print("FINISHED")
        return lyrics, vocabulary, song_id 