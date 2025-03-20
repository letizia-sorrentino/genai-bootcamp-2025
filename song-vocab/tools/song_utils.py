import os
import json
import re
from typing import List, Dict
from ..core.database import Database

# Initialize database
db = Database()

def generate_song_id(title: str) -> str:
    """
    Generate a URL-safe song ID from the title.
    
    Args:
        title (str): The song title
        
    Returns:
        str: URL-safe song ID
    """
    # Convert to lowercase and replace spaces with hyphens
    song_id = title.lower()
    # Remove special characters and replace spaces with hyphens
    song_id = re.sub(r'[^a-z0-9\s-]', '', song_id)
    song_id = re.sub(r'\s+', '-', song_id)
    # Remove leading/trailing hyphens
    song_id = song_id.strip('-')
    return song_id

def save_results(song_id: str, lyrics: str, vocabulary: List[Dict], title: str = None, artist: str = None):
    """
    Save lyrics and vocabulary to files in the output folder and database.
    
    Args:
        song_id (str): The unique song ID
        lyrics (str): The song lyrics
        vocabulary (List[Dict]): List of vocabulary words
        title (str, optional): Song title
        artist (str, optional): Song artist
    """
    # Create output directory if it doesn't exist
    output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "output")
    os.makedirs(output_dir, exist_ok=True)
    
    # Save lyrics to a text file
    lyrics_file = os.path.join(output_dir, f"{song_id}_lyrics.txt")
    with open(lyrics_file, 'w', encoding='utf-8') as f:
        f.write(lyrics)
    
    # Save vocabulary to a JSON file
    vocab_file = os.path.join(output_dir, f"{song_id}_vocabulary.json")
    with open(vocab_file, 'w', encoding='utf-8') as f:
        json.dump(vocabulary, f, ensure_ascii=False, indent=2)
    
    # Save to database if title and artist are provided
    if title and artist:
        db.save_song(title, artist, song_id, vocabulary) 