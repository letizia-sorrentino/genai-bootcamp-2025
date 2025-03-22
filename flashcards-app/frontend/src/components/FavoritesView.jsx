import { useState, useEffect } from 'react';
import axios from 'axios';
import FlashcardDeck from './FlashcardDeck';
import '../styles/FavoritesView.css';

const FavoritesView = () => {
  const [favoriteCards, setFavoriteCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
                word: response.data.word,
                translation: response.data.translation,
                example: response.data.example,
                pronunciation: response.data.pronunciation
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

    loadFavorites();
  }, []);

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

  return (
    <div className="favorites-view">
      <h2>My Favorite Cards</h2>
      <FlashcardDeck flashcards={favoriteCards} />
    </div>
  );
};

export default FavoritesView; 