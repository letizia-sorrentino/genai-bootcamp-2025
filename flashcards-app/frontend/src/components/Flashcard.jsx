import { useState } from 'react';
import '../styles/Flashcard.css';

const Flashcard = ({ word, translation, isFlipped, onFlip, isFavorite, onToggleFavorite, imageUrl, isLoading }) => {
  const [error, setError] = useState(null);

  const handleFavoriteClick = (e) => {
    e.stopPropagation(); // Prevent card flip when clicking favorite button
    onToggleFavorite(word);
  };

  return (
    <div 
      className={`flashcard ${isFlipped ? 'flipped' : ''}`}
      onClick={onFlip}
    >
      <div className="flashcard-inner">
        <div className="flashcard-front">
          <div className="word">{word}</div>
          <div className="image-container">
            {isLoading && <div className="loading-spinner" />}
            {error && <div className="error-message">{error}</div>}
            {imageUrl && (
              <img
                src={imageUrl}
                alt={word}
                className="card-image"
                onError={(e) => {
                  console.error('Error loading image:', e);
                  setError('Failed to load image');
                }}
              />
            )}
          </div>
          <button 
            className={`favorite-button ${isFavorite ? 'favorite' : ''}`}
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? '★' : '☆'}
          </button>
        </div>
        <div className="flashcard-back">
          <div className="translation">{translation}</div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard; 