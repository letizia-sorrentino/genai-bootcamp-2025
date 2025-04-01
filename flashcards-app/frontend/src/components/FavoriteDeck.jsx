import FlashcardDeck from './FlashcardDeck';
import '../styles/FavoriteDeck.css';

const FavoriteDeck = ({ flashcards, onBack }) => {
  return (
    <div className="favorite-deck">
      <div className="top-nav">
        <div className="nav-content">
          <button 
            className="back-button"
            onClick={onBack}
          >
            ← Back to List
          </button>
          <h2 className="nav-title">Playing Favorites</h2>
        </div>
      </div>
      <div className="deck-container">
        <FlashcardDeck 
          flashcards={flashcards} 
          category="favorites"
        />
      </div>
    </div>
  );
};

export default FavoriteDeck; 