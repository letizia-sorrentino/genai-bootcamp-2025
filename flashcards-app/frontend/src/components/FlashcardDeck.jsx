import { useState, useEffect } from 'react';
import axios from 'axios';
import Flashcard from './Flashcard';
import '../styles/FlashcardDeck.css';

const FlashcardDeck = ({ flashcards, category }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [favorites, setFavorites] = useState(new Set());

  // Load favorites on component mount
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/favorites');
        setFavorites(new Set(response.data.favorites));
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };
    loadFavorites();
  }, []);

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleToggleFavorite = async (word) => {
    try {
      const isCurrentlyFavorite = favorites.has(word);
      const endpoint = isCurrentlyFavorite 
        ? `http://localhost:3000/api/favorites/${encodeURIComponent(word)}`
        : 'http://localhost:3000/api/favorites';
      
      const method = isCurrentlyFavorite ? 'delete' : 'post';
      
      const response = await axios[method](endpoint, isCurrentlyFavorite ? {} : { word, category });
      setFavorites(new Set(response.data.favorites));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (!flashcards.length) return null;

  const currentWord = flashcards[currentIndex].word;

  return (
    <div className="flashcard-deck">
      <nav className="top-nav">
        <div className="nav-content">
          <h2 className="nav-title">{category}</h2>
          <div className="nav-counter">
            {currentIndex + 1} / {flashcards.length}
          </div>
        </div>
      </nav>

      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${(currentIndex + 1) / flashcards.length * 100}%` }}
        />
      </div>

      <div className="deck-content">
        <button 
          className="nav-button prev-button" 
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          aria-label="Previous card"
        >
          ←
        </button>

        <Flashcard
          word={currentWord}
          translation={flashcards[currentIndex].translation}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped(!isFlipped)}
          isFavorite={favorites.has(currentWord)}
          onToggleFavorite={handleToggleFavorite}
        />

        <button 
          className="nav-button next-button" 
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
          aria-label="Next card"
        >
          →
        </button>
      </div>
    </div>
  );
};

export default FlashcardDeck; 