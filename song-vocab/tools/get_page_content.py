# This tool takes web page content and parses it to extract the target text.
import requests
from bs4 import BeautifulSoup
from typing import Optional

def get_page_content(url: str) -> str:
    """
    Fetch and extract content from a webpage.
    
    Args:
        url (str): URL of the webpage
        
    Returns:
        str: Extracted text content from the webpage
    """
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
            
        # Get text content
        text = soup.get_text()
        
        # Clean up whitespace
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = ' '.join(chunk for chunk in chunks if chunk)
        
        return text
    except Exception as e:
        raise Exception(f"Error fetching content from {url}: {str(e)}") 