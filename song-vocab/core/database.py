import sqlite3
import json
from typing import List, Dict, Optional
import os

class Database:
    def __init__(self, db_path: str = "vocabulary.db"):
        """Initialize database connection and create tables if they don't exist."""
        self.db_path = db_path
        self._create_tables()

    def _create_tables(self):
        """Create necessary database tables if they don't exist."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Create songs table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS songs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    artist TEXT,
                    song_id TEXT UNIQUE NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Create vocabulary table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS vocabulary (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    song_id TEXT NOT NULL,
                    italian TEXT NOT NULL,
                    english TEXT NOT NULL,
                    parts TEXT NOT NULL,
                    FOREIGN KEY (song_id) REFERENCES songs(song_id),
                    UNIQUE(song_id, italian)
                )
            ''')
            
            # Create word_groups table for categorizing vocabulary
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS word_groups (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL UNIQUE,
                    description TEXT
                )
            ''')
            
            # Create vocabulary_word_groups junction table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS vocabulary_word_groups (
                    vocabulary_id INTEGER,
                    group_id INTEGER,
                    FOREIGN KEY (vocabulary_id) REFERENCES vocabulary(id),
                    FOREIGN KEY (group_id) REFERENCES word_groups(id),
                    PRIMARY KEY (vocabulary_id, group_id)
                )
            ''')
            
            conn.commit()

    def save_song(self, title: str, artist: str, song_id: str, vocabulary: List[Dict]) -> bool:
        """
        Save a song and its vocabulary to the database.
        
        Args:
            title (str): Song title
            artist (str): Song artist
            song_id (str): Unique song identifier
            vocabulary (List[Dict]): List of vocabulary words
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Insert song
                cursor.execute(
                    "INSERT INTO songs (title, artist, song_id) VALUES (?, ?, ?)",
                    (title, artist, song_id)
                )
                
                # Insert vocabulary
                for word in vocabulary:
                    cursor.execute(
                        """
                        INSERT INTO vocabulary (song_id, italian, english, parts)
                        VALUES (?, ?, ?, ?)
                        """,
                        (
                            song_id,
                            word["italian"],
                            word["english"],
                            json.dumps(word["parts"])
                        )
                    )
                
                conn.commit()
                return True
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            return False

    def get_song_vocabulary(self, song_id: str) -> Optional[List[Dict]]:
        """
        Retrieve vocabulary for a specific song.
        
        Args:
            song_id (str): Unique song identifier
            
        Returns:
            Optional[List[Dict]]: List of vocabulary words or None if not found
        """
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    """
                    SELECT id, italian, english, parts
                    FROM vocabulary
                    WHERE song_id = ?
                    ORDER BY id
                    """,
                    (song_id,)
                )
                
                vocabulary = []
                for row in cursor.fetchall():
                    vocabulary.append({
                        "id": row[0],
                        "italian": row[1],
                        "english": row[2],
                        "parts": json.loads(row[3])
                    })
                return vocabulary
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            return None

    def get_all_vocabulary(self) -> List[Dict]:
        """
        Retrieve all vocabulary from the database.
        
        Returns:
            List[Dict]: List of all vocabulary words
        """
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    """
                    SELECT v.id, v.italian, v.english, v.parts, s.title, s.artist
                    FROM vocabulary v
                    JOIN songs s ON v.song_id = s.song_id
                    ORDER BY v.id
                    """
                )
                
                vocabulary = []
                for row in cursor.fetchall():
                    vocabulary.append({
                        "id": row[0],
                        "italian": row[1],
                        "english": row[2],
                        "parts": json.loads(row[3]),
                        "song_title": row[4],
                        "artist": row[5]
                    })
                return vocabulary
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            return []

    def add_word_group(self, name: str, description: str = None) -> bool:
        """
        Add a new word group category.
        
        Args:
            name (str): Group name
            description (str, optional): Group description
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT INTO word_groups (name, description) VALUES (?, ?)",
                    (name, description)
                )
                conn.commit()
                return True
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            return False

    def assign_word_to_group(self, vocabulary_id: int, group_id: int) -> bool:
        """
        Assign a vocabulary word to a group.
        
        Args:
            vocabulary_id (int): Vocabulary word ID
            group_id (int): Group ID
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    """
                    INSERT INTO vocabulary_word_groups (vocabulary_id, group_id)
                    VALUES (?, ?)
                    """,
                    (vocabulary_id, group_id)
                )
                conn.commit()
                return True
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            return False 