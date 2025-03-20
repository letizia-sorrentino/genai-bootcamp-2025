# This tool uses duckduck go to search the internet for pages to then further crawl.

from duckduckgo_search import DDGS
from typing import List

def search_web_serp(query: str, max_results: int = 5) -> List[str]:
    """
    Search for Italian song lyrics using DuckDuckGo.
    
    Args:
        query (str): Search query (should include "lyrics" and preferably "Italian")
        max_results (int): Maximum number of results to return
        
    Returns:
        List[str]: List of URLs from search results
    """
    # Ensure we're searching for Italian lyrics
    if "italian" not in query.lower():
        query = f"{query} italian lyrics"
        
    with DDGS() as ddgs:
        results = list(ddgs.text(query, max_results=max_results))
        return [result['link'] for result in results]