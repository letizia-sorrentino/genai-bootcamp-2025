import { useState, useEffect } from 'react';
import axios from 'axios';
import Flashcard from './Flashcard';
import '../styles/FlashcardDeck.css';

const FlashcardDeck = ({ flashcards, category }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [imageUrls, setImageUrls] = useState({});
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [error, setError] = useState(null);

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

  // Generate image for current card
  useEffect(() => {
    const generateImage = async () => {
      const currentWord = flashcards[currentIndex].word;
      
      // Skip if image already exists
      if (imageUrls[currentWord]) {
        setIsLoadingImage(false);
        return;
      }

      setIsLoadingImage(true);
      setError(null);

      try {
        console.log('Generating image for:', currentWord);
        const response = await axios.post('http://localhost:3000/api/generate-image', {
          prompt: `A clear, simple illustration of ${currentWord} for a language learning flashcard`,
          model: 'dalle',
          options: {
            size: '1024x1024',
            quality: 'standard',
            promptType: 'flashcard',
            promptParams: {
              word: currentWord,
              translation: flashcards[currentIndex].translation
            }
          }
        });

        if (response.data.imageUrl) {
          setImageUrls(prev => ({
            ...prev,
            [currentWord]: response.data.imageUrl
          }));
        } else {
          throw new Error('No image URL in response');
        }
      } catch (error) {
        console.error('Error generating image:', error);
        setError('Failed to generate image');
      } finally {
        setIsLoadingImage(false);
      }
    };

    generateImage();
  }, [currentIndex, flashcards]);

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
          imageUrl={imageUrls[currentWord]}
          isLoading={isLoadingImage}
          error={error}
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