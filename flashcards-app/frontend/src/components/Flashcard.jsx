import { useState } from 'react';
import '../styles/Flashcard.css';

const Flashcard = ({ word, translation, imageUrl, isFlipped, onFlip }) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <div 
      className={`flashcard ${isFlipped ? 'flipped' : ''}`}
      onClick={onFlip}
    >
      <div className="flashcard-inner">
        <div className="flashcard-front">
          <div className="word">{word}</div>
          {imageUrl && (
            <div className="image-container">
              {isLoading && <div className="loading-spinner" />}
              <img
                src={imageUrl}
                alt={word}
                onLoad={handleImageLoad}
                className="card-image"
              />
            </div>
          )}
        </div>
        <div className="flashcard-back">
          <div className="translation">{translation}</div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard; 