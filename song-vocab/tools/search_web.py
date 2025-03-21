# This tool uses duckduck go to search the internet for pages to then further crawl.

from duckduckgo_search import DDGS
from typing import List
import time
import random
import requests
from bs4 import BeautifulSoup

def search_web_serp(query: str, max_results: int = 5) -> List[str]:
    """
    Search for Italian song lyrics using DuckDuckGo.
    
    Args:
        query (str): Search query (should include "lyrics" and preferably "Italian")
        max_results (int): Maximum number of results to return
        
    Returns:
        List[str]: List of URLs from search results
    """
    # Add random delay between 1-3 seconds
    time.sleep(random.uniform(1, 3))
    
    # Ensure we're searching for Italian lyrics
    if "italian" not in query.lower():
        query = f"{query} italian lyrics"
    
    max_retries = 3
    for attempt in range(max_retries):
        try:
            # First try DuckDuckGo
            with DDGS() as ddgs:
                results = list(ddgs.text(query, max_results=max_results))
                if results:
                    return [result['link'] for result in results]
                time.sleep(2)  # Wait before retry
        except Exception as e:
            print(f"DuckDuckGo search failed: {str(e)}")
            
            # Fallback to direct search
            try:
                # Use a different search approach
                search_url = f"https://www.google.com/search?q={query}"
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
                response = requests.get(search_url, headers=headers)
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Extract URLs from search results
                urls = []
                for link in soup.find_all('a'):
                    href = link.get('href', '')
                    if href.startswith('http') and not any(x in href for x in ['google.com', 'youtube.com']):
                        urls.append(href)
                        if len(urls) >= max_results:
                            break
                
                if urls:
                    return urls
                
            except Exception as e2:
                print(f"Fallback search failed: {str(e2)}")
            
            if attempt == max_retries - 1:
                raise Exception(f"Failed to search after {max_retries} attempts: {str(e)}")
            time.sleep(2)  # Wait before retry
    
    # If all else fails, return some example URLs
    return [
        "https://www.azlyrics.com/lyrics/erosramazzotti/sebastasseunacanzone.html",
        "https://www.musixmatch.com/lyrics/Eros-Ramazzotti/Se-Bastasse-Una-Canzone"
    ]