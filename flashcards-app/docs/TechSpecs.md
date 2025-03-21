# Italian Flashcards App - Technical Specification

## Overview
This document outlines the technical specifications for building an Italian language learning flashcard application. The app will generate flashcards with images for Italian vocabulary words using Amazon Bedrock for AI image generation.

## Tech Stack
- **Frontend**: React (Vite)
- **Backend**: Node.js with Express
- **Image Generation**: Amazon Bedrock (Stable Diffusion XL and Amazon Titan Image Generator)
- **Deployment**: Local development (can be extended to cloud deployment)

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────────┐
│   React     │ ◄─── │   Express    │ ◄─── │  Amazon Bedrock │
│  Frontend   │ ──► │   Backend    │ ──► │  Image Services  │
└─────────────┘      └──────────────┘      └─────────────────┘
```

## Development Setup Requirements
- Node.js v14+ and npm
- AWS account with Amazon Bedrock access
- AWS IAM credentials with Bedrock permissions
- Git for version control
- Cursor IDE

## API Endpoints

### Backend API (Express)

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/generate-image` | POST | Generate a single image | `{ word: string, provider: string }` | `{ imageUrl: string }` |
| `/api/generate-flashcards` | POST | Generate multiple flashcards | `{ words: string[], provider: string }` | `{ flashcards: [{word: string, imageUrl: string}] }` |

### Amazon Bedrock API

- **Stable Diffusion XL**: `stability.stable-diffusion-xl-v1`
- **Amazon Titan Image Generator**: `amazon.titan-image-generator-v1`

## Project Structure

```
italian-flashcards/
├── backend/
│   ├── .env                 # AWS credentials and configuration
│   ├── package.json         # Backend dependencies
│   └── server.js            # Express server with Bedrock integration
├── src/
│   ├── App.jsx              # Main app component
│   ├── App.css              # Main app styles
│   ├── components/
│   │   ├── FlashcardDeck.jsx     # Flashcard display and navigation
│   │   ├── FlashcardDeck.css
│   │   ├── LoadingScreen.jsx     # Loading indicator
│   │   ├── LoadingScreen.css
│   │   ├── ModelSelector.jsx     # LLM model selection
│   │   ├── ModelSelector.css
│   │   ├── WordInput.jsx         # Word entry/selection
│   │   └── WordInput.css
├── .env                     # Frontend environment variables
├── package.json             # Frontend dependencies
└── vite.config.js           # Vite configuration
```

## Implementation Steps

### 1. Project Initialization

```bash
# Create frontend project
npm create vite@latest italian-flashcards -- --template react
cd italian-flashcards
npm install
npm install react-swipeable axios react-icons

# Create backend directory
mkdir backend
cd backend
npm init -y
npm install express cors dotenv axios aws-sdk uuid
cd ..
```

### 2. Backend Implementation

Create `backend/server.js`:

```javascript
const express = require('express');
const cors = require('cors');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure AWS
const configureAWS = () => {
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
  });
};

// Create Bedrock Runtime client
const getBedrockRuntime = () => {
  configureAWS();
  return new AWS.BedrockRuntime();
};

// LLM Router for different Amazon Bedrock models
const llmRouter = {
  // Stable Diffusion XL
  stableDiffusion: async (word) => {
    try {
      const bedrockRuntime = getBedrockRuntime();
      
      const params = {
        modelId: 'stability.stable-diffusion-xl-v1',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          text_prompts: [
            {
              text: `A simple, clear image representing the Italian word "${word}"`
            }
          ],
          cfg_scale: 7,
          height: 512,
          width: 512,
          steps: 30,
          seed: Math.floor(Math.random() * 1000000)
        })
      };
      
      const response = await bedrockRuntime.invokeModel(params).promise();
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      // Convert base64 image to data URL
      return `data:image/png;base64,${responseBody.artifacts[0].base64}`;
    } catch (error) {
      console.error('Error generating image with Stable Diffusion:', error);
      return null;
    }
  },
  
  // Amazon Titan Image Generator
  titanImage: async (word) => {
    try {
      const bedrockRuntime = getBedrockRuntime();
      
      const params = {
        modelId: 'amazon.titan-image-generator-v1',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          taskType: "TEXT_IMAGE",
          textToImageParams: {
            text: `A simple, clear image representing the Italian word "${word}"`,
            negativeText: "blurry, distorted, low quality",
          },
          imageGenerationConfig: {
            numberOfImages: 1,
            height: 512,
            width: 512,
            cfgScale: 8.0
          }
        })
      };
      
      const response = await bedrockRuntime.invokeModel(params).promise();
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      // Return the base64 image
      return `data:image/png;base64,${responseBody.images[0]}`;
    } catch (error) {
      console.error('Error generating image with Titan Image Generator:', error);
      return null;
    }
  }
};

// Routes
app.post('/api/generate-image', async (req, res) => {
  const { word, provider = 'stableDiffusion' } = req.body;
  
  if (!word) {
    return res.status(400).json({ error: 'Word is required' });
  }
  
  try {
    // Get the appropriate LLM provider function
    const generatorFn = llmRouter[provider];
    
    if (!generatorFn) {
      return res.status(400).json({ error: 'Invalid provider' });
    }
    
    // Generate image
    const imageUrl = await generatorFn(word);
    
    if (!imageUrl) {
      return res.status(500).json({ error: 'Failed to generate image' });
    }
    
    res.json({ imageUrl });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Generate flashcards for multiple words
app.post('/api/generate-flashcards', async (req, res) => {
  const { words, provider = 'stableDiffusion' } = req.body;
  
  if (!words || !Array.isArray(words) || words.length === 0) {
    return res.status(400).json({ error: 'Words array is required' });
  }
  
  try {
    const flashcards = [];
    
    // Process each word
    for (const word of words) {
      // Generate image
      const generatorFn = llmRouter[provider];
      const imageUrl = await generatorFn(word);
      
      if (imageUrl) {
        flashcards.push({
          word,
          imageUrl
        });
      }
    }
    
    res.json({ flashcards });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

Create `backend/.env`:

```
# Server configuration
PORT=5000

# AWS credentials for Amazon Bedrock
AWS_ACCESS_KEY_ID=your_aws_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
AWS_REGION=us-east-1
```

### 3. Frontend Components Implementation

#### App.jsx
```jsx
import { useState, useEffect } from 'react';
import './App.css';
import FlashcardDeck from './components/FlashcardDeck';
import ModelSelector from './components/ModelSelector';
import WordInput from './components/WordInput';
import LoadingScreen from './components/LoadingScreen';
import axios from 'axios';

function App() {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('stableDiffusion');
  
  // Function to generate flashcards
  const generateFlashcards = async (words) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/generate-flashcards', {
        words,
        provider: selectedModel
      });
      
      setFlashcards(response.data.flashcards);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      alert('Failed to generate flashcards. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Example Italian words
  const exampleWords = [
    'casa', 'gatto', 'cane', 'albero', 'sole', 
    'luna', 'mare', 'montagna', 'fiore', 'libro'
  ];
  
  return (
    <div className="app-container">
      <header>
        <h1>Italian Flashcards</h1>
      </header>
      
      <main>
        {loading ? (
          <LoadingScreen />
        ) : flashcards.length > 0 ? (
          <FlashcardDeck flashcards={flashcards} />
        ) : (
          <div className="setup-container">
            <ModelSelector 
              selectedModel={selectedModel} 
              onSelectModel={setSelectedModel} 
            />
            <WordInput onSubmit={generateFlashcards} exampleWords={exampleWords} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
```

#### FlashcardDeck.jsx
```jsx
import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import './FlashcardDeck.css';

const FlashcardDeck = ({ flashcards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  
  // Calculate total number of cards
  const totalCards = flashcards.length;
  
  // Handle card flipping
  const flipCard = () => {
    setFlipped(!flipped);
  };
  
  // Navigate to the next card
  const nextCard = () => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(currentIndex + 1);
      setFlipped(false);
    }
  };
  
  // Navigate to the previous card
  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setFlipped(false);
    }
  };
  
  // Set up swipe handlers
  const handlers = useSwipeable({
    onSwipedLeft: nextCard,
    onSwipedRight: prevCard,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });
  
  // Reset to first card
  const resetDeck = () => {
    setCurrentIndex(0);
    setFlipped(false);
  };
  
  // Get current flashcard
  const currentCard = flashcards[currentIndex];
  
  if (!currentCard) {
    return <div>No flashcards available</div>;
  }
  
  return (
    <div className="flashcard-container">
      <div className="progress-bar">
        <div 
          className="progress" 
          style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
        ></div>
      </div>
      
      <div className="card-count">
        Card {currentIndex + 1} of {totalCards}
      </div>
      
      <div 
        className={`flashcard ${flipped ? 'flipped' : ''}`} 
        onClick={flipCard}
        {...handlers}
      >
        <div className="card-front">
          <img 
            src={currentCard.imageUrl} 
            alt={`Visual representation of ${currentCard.word}`} 
            className="card-image"
          />
        </div>
        <div className="card-back">
          <h2>{currentCard.word}</h2>
          <p className="pronunciation">Pronunciation guide here</p>
        </div>
      </div>
      
      <div className="card-navigation">
        <button 
          onClick={prevCard} 
          disabled={currentIndex === 0}
          className="nav-button"
        >
          Previous
        </button>
        <button onClick={flipCard} className="flip-button">
          {flipped ? 'Show Image' : 'Show Word'}
        </button>
        <button 
          onClick={nextCard} 
          disabled={currentIndex === totalCards - 1}
          className="nav-button"
        >
          Next
        </button>
      </div>
      
      <button onClick={resetDeck} className="reset-button">
        Restart Deck
      </button>
    </div>
  );
};

export default FlashcardDeck;
```

#### ModelSelector.jsx
```jsx
import './ModelSelector.css';

const ModelSelector = ({ selectedModel, onSelectModel }) => {
  const models = [
    { id: 'stableDiffusion', name: 'Stable Diffusion XL (Bedrock)' },
    { id: 'titanImage', name: 'Amazon Titan Image Generator' }
  ];
  
  return (
    <div className="model-selector">
      <h2>Select Image Generation Model</h2>
      <div className="model-options">
        {models.map((model) => (
          <div 
            key={model.id}
            className={`model-option ${selectedModel === model.id ? 'selected' : ''}`}
            onClick={() => onSelectModel(model.id)}
          >
            <div className="model-radio">
              <div className="radio-inner"></div>
            </div>
            <span>{model.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModelSelector;
```

#### WordInput.jsx
```jsx
import { useState } from 'react';
import './WordInput.css';

const WordInput = ({ onSubmit, exampleWords }) => {
  const [words, setWords] = useState('');
  const [useExamples, setUseExamples] = useState(true);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Use example words or user-provided words
    const wordList = useExamples 
      ? exampleWords 
      : words.split(',').map(word => word.trim()).filter(word => word);
    
    if (wordList.length === 0) {
      alert('Please enter at least one word.');
      return;
    }
    
    onSubmit(wordList);
  };
  
  return (
    <div className="word-input">
      <h2>Choose Your Words</h2>
      
      <div className="option-toggle">
        <div 
          className={`toggle-option ${useExamples ? 'active' : ''}`}
          onClick={() => setUseExamples(true)}
        >
          Use Example Words
        </div>
        <div 
          className={`toggle-option ${!useExamples ? 'active' : ''}`}
          onClick={() => setUseExamples(false)}
        >
          Enter Custom Words
        </div>
      </div>
      
      {useExamples ? (
        <div className="example-words">
          <p>We'll use these 10 Italian words:</p>
          <div className="word-chips">
            {exampleWords.map((word, index) => (
              <div key={index} className="word-chip">
                {word}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="words">Enter Italian words (comma-separated):</label>
            <textarea
              id="words"
              value={words}
              onChange={(e) => setWords(e.target.value)}
              placeholder="casa, gatto, cane, ..."
              rows={4}
            />
          </div>
        </form>
      )}
      
      <button className="generate-button" onClick={handleSubmit}>
        Generate Flashcards
      </button>
    </div>
  );
};

export default WordInput;
```

#### LoadingScreen.jsx
```jsx
import './LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>Generating your flashcards...</p>
      <p className="loading-info">This may take a moment while we create images for each word.</p>
    </div>
  );
};

export default LoadingScreen;
```

### 4. CSS Implementation

#### App.css
```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

.app-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

header {
  text-align: center;
  margin-bottom: 2rem;
}

header h1 {
  color: #2a7d8b;
  font-size: 2.5rem;
}

.setup-container {
  background: white;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Responsive design */
@media (max-width: 768px) {
  .app-container {
    padding: 1rem;
  }
  
  header h1 {
    font-size: 2rem;
  }
}
```

#### FlashcardDeck.css, ModelSelector.css, WordInput.css, LoadingScreen.css
(See earlier artifacts for complete CSS implementation)

## AWS Bedrock Configuration

1. **Create IAM User**
   - Go to AWS IAM Console
   - Create a new user with programmatic access
   - Attach the `AmazonBedrockFullAccess` policy

2. **Enable Models in Bedrock**
   - Go to AWS Bedrock console
   - Navigate to Model Access
   - Request access to:
     - Stability Stable Diffusion XL
     - Amazon Titan Image Generator

3. **Generate Access Keys**
   - Create access keys for your IAM user
   - Add the keys to your backend `.env` file

## Running the Application

1. **Start Backend**
```bash
cd backend
node server.js
```

2. **Start Frontend**
```bash
# In a new terminal
npm run dev
```

## Testing

- Verify that the server is running on port 5000
- Test the frontend at the URL provided by Vite (typically http://localhost:5173)
- Try generating flashcards with both models
- Test card swiping and flipping functionality

## Troubleshooting

- **CORS errors**: Ensure backend has proper CORS middleware enabled
- **AWS Authentication Errors**: Verify your AWS credentials and permissions
- **Model Access Errors**: Confirm you have enabled the models in your AWS Bedrock console
- **Rate Limits**: Be aware of AWS Bedrock rate limits during testing

## Next Steps (Future Enhancements)

- Add user accounts and saved flashcard sets
- Implement audio pronunciation using Amazon Polly
- Add quiz mode to test knowledge retention
- Expand to other languages
- Deploy to a cloud provider for production use