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
        setError('Failed to load favorites');
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
      
      if (method === 'post') {
        await axios.post(endpoint, { word, category: category || 'favorites' });
      } else {
        await axios.delete(endpoint);
      }

      // Update local favorites state
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        if (isCurrentlyFavorite) {
          newFavorites.delete(word);
        } else {
          newFavorites.add(word);
        }
        return newFavorites;
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setError('Failed to update favorites');
    }
  };

  const currentCard = flashcards[currentIndex];
  if (!currentCard) return null;

  return (
    <div className="flashcard-deck">
      <div className="deck-content">
        <button 
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="nav-button prev-button"
          aria-label="Previous card"
        >
          ←
        </button>

        <Flashcard
          word={currentCard.word}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped(!isFlipped)}
          isFavorite={favorites.has(currentCard.word)}
          onToggleFavorite={handleToggleFavorite}
          imageUrl={imageUrls[currentCard.word]}
          isLoading={isLoadingImage}
        />

        <button 
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
          className="nav-button next-button"
          aria-label="Next card"
        >
          →
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default FlashcardDeck; 