import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import Flashcard from './Flashcard';
import '../styles/FlashcardDeck.css';

const FlashcardDeck = ({ flashcards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
      }
    },
    onSwipedRight: () => {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
        setIsFlipped(false);
      }
    },
    onTap: () => setIsFlipped(!isFlipped),
    trackMouse: true,
    preventDefaultTouchmoveEvent: true,
  });

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

  if (!flashcards.length) return null;

  return (
    <div className="flashcard-deck" {...handlers}>
      <div className="deck-controls">
        <button 
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="nav-button"
        >
          Previous
        </button>
        <span className="card-counter">
          {currentIndex + 1} / {flashcards.length}
        </span>
        <button 
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
          className="nav-button"
        >
          Next
        </button>
      </div>
      <Flashcard
        word={flashcards[currentIndex].word}
        translation={flashcards[currentIndex].translation}
        isFlipped={isFlipped}
        onFlip={() => setIsFlipped(!isFlipped)}
      />
    </div>
  );
};

export default FlashcardDeck; 