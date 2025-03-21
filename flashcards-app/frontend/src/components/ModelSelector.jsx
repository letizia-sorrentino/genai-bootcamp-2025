import '../styles/ModelSelector.css';

const ModelSelector = ({ selectedModel, onModelChange }) => {
  const categories = [
    { id: 'greetings', name: 'Greetings' },
    { id: 'numbers', name: 'Numbers' },
    { id: 'colors', name: 'Colors' },
    { id: 'food', name: 'Food & Drinks' },
    { id: 'animals', name: 'Animals' },
    { id: 'family', name: 'Family' },
    { id: 'travel', name: 'Travel' },
    { id: 'common-phrases', name: 'Common Phrases' }
  ];

  return (
    <div className="model-selector">
      <label htmlFor="category-select">Select a Category:</label>
      <select
        id="category-select"
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        className="model-select"
      >
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ModelSelector; 