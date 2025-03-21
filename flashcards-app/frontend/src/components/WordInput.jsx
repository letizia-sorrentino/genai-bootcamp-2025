import { useState } from 'react';
import '../styles/WordInput.css';

const WordInput = ({ onSubmit, exampleWords, isLoading }) => {
  const [words, setWords] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (words.trim()) {
      const wordArray = words.split(',').map(word => word.trim()).filter(word => word);
      onSubmit(wordArray);
      setWords('');
    }
  };

  const handleExampleClick = () => {
    setWords(exampleWords.join(', '));
  };

  return (
    <div className="word-input-container">
      <form onSubmit={handleSubmit} className="word-input-form">
        <div className="input-group">
          <input
            type="text"
            value={words}
            onChange={(e) => setWords(e.target.value)}
            placeholder="Enter Italian words (comma-separated)..."
            className="word-input"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading || !words.trim()}
          >
            Generate Flashcards
          </button>
        </div>
      </form>
      <button 
        onClick={handleExampleClick}
        className="example-button"
        disabled={isLoading}
      >
        Use Example Words
      </button>
    </div>
  );
};

export default WordInput; 