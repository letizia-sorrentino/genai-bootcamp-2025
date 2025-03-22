import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../styles/Flashcard.css';

const Flashcard = ({ word, translation, isFlipped, onFlip }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const requestInProgress = useRef(false);

  useEffect(() => {
    const loadImage = async () => {
      if (!imageUrl && !isLoading && !requestInProgress.current) {
        requestInProgress.current = true;
        setIsLoading(true);
        try {
          console.log('Requesting image for word:', word);
          const response = await axios.post('http://localhost:3000/api/generate-image', {
            word
          });
          console.log('Received image response:', response.data);
          
          if (response.data.imageUrl) {
            setImageUrl(response.data.imageUrl);
          } else {
            throw new Error('No image URL in response');
          }
        } catch (error) {
          console.error('Error generating image:', error);
          setError('Failed to generate image');
        } finally {
          setIsLoading(false);
          requestInProgress.current = false;
        }
      }
    };

    loadImage();
  }, [word]);

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
        </div>
        <div className="flashcard-back">
          <div className="translation">{translation}</div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard; 