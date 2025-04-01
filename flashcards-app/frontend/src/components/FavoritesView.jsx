import { useState, useEffect } from 'react';
import axios from 'axios';
import FavoriteDeck from './FavoriteDeck';
import '../styles/FavoritesView.css';

const FavoritesView = () => {
  const [favoriteCards, setFavoriteCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      // First get the list of favorite words
      const favoritesResponse = await axios.get('http://localhost:3000/api/favorites');
      const favoriteWords = favoritesResponse.data.favorites;

      if (favoriteWords.length === 0) {
        setFavoriteCards([]);
        return;
      }

      // Then get the details for each favorite word
      const cards = await Promise.all(
        favoriteWords.map(async (word) => {
          try {
            const response = await axios.get(`http://localhost:3000/api/flashcard/${encodeURIComponent(word)}`);
            return {
              word: response.data.word
            };
          } catch (error) {
            console.error(`Error loading details for word ${word}:`, error);
            return null;
          }
        })
      );

      // Filter out any failed requests
      setFavoriteCards(cards.filter(card => card !== null));
    } catch (error) {
      console.error('Error loading favorites:', error);
      setError('Failed to load favorite cards');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (word) => {
    try {
      await axios.delete(`http://localhost:3000/api/favorites/${encodeURIComponent(word)}`);
      // Reload favorites after removing
      loadFavorites();
    } catch (error) {
      console.error('Error removing favorite:', error);
      setError('Failed to remove card from favorites');
    }
  };

  if (isLoading) {
    return (
      <div className="favorites-view">
        <h2>My Favorite Cards</h2>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="favorites-view">
        <h2>My Favorite Cards</h2>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (favoriteCards.length === 0) {
    return (
      <div className="favorites-view">
        <h2>My Favorite Cards</h2>
        <div className="empty-state">
          <p>You haven't added any cards to your favorites yet.</p>
          <p>Click the star icon on any card to add it to your favorites!</p>
        </div>
      </div>
    );
  }

  if (isPlaying) {
    return (
        <FavoriteDeck 
          flashcards={favoriteCards}
          onBack={() => setIsPlaying(false)}
        />
    );
  }

  return (
    <div className="favorites-view">
      <div className="favorites-header">
        <h2>My Favorite Cards</h2>
        <button 
          className="play-button"
          onClick={() => setIsPlaying(true)}
        >
          Play Deck →
        </button>
      </div>
      <div className="favorites-list">
        {favoriteCards.map((card, index) => (
          <div key={index} className="favorite-card-item">
            <div className="card-content">
              <div className="card-word">{card.word}</div>
            </div>
            <button 
              className="remove-favorite-button"
              onClick={() => handleRemoveFavorite(card.word)}
              aria-label="Remove from favorites"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoritesView; 