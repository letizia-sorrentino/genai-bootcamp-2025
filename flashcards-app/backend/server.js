const express = require('express');
const cors = require('cors');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));
app.use(express.json());

// Configure AWS
// const configureAWS = () => {
//   AWS.config.update({
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     region: process.env.AWS_REGION || 'us-east-1'
//   });
// };

// Create Bedrock Runtime client
// const getBedrockRuntime = () => {
//   configureAWS();
//   return new AWS.BedrockRuntime();
// };

// Rate limiting middleware
const userLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // 1000 requests per hour
  message: { error: 'Too many requests', message: 'Please try again later' }
});

// Load vocabulary data
let vocabularyData = null;

async function loadVocabularyData() {
  try {
    const data = await fs.readFile(path.join(__dirname, 'data', 'vocabulary.json'), 'utf8');
    vocabularyData = JSON.parse(data);
  } catch (error) {
    console.error('Error loading vocabulary data:', error);
    vocabularyData = { categories: [] };
  }
}

// Load data on startup
loadVocabularyData();

// Routes

// 1. Categories
app.get('/api/categories', (req, res) => {
  if (!vocabularyData) {
    return res.status(500).json({ error: 'Vocabulary data not loaded' });
  }
  res.json(vocabularyData);
});

app.get('/api/categories/:categoryId', (req, res) => {
  if (!vocabularyData) {
    return res.status(500).json({ error: 'Vocabulary data not loaded' });
  }
  
  const category = vocabularyData.categories.find(c => c.id === req.params.categoryId);
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }
  
  res.json(category);
});

app.get('/api/words/:categoryId', (req, res) => {
  if (!vocabularyData) {
    return res.status(500).json({ error: 'Vocabulary data not loaded' });
  }
  
  const category = vocabularyData.categories.find(c => c.id === req.params.categoryId);
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }
  
  res.json({ words: category.words });
});

// 2. Example Words
app.get('/api/example-words', (req, res) => {
  const examples = {
    greetings: ['ciao', 'buongiorno', 'arrivederci', 'salve', 'buonasera'],
    numbers: ['uno', 'due', 'tre', 'quattro', 'cinque'],
    colors: ['rosso', 'blu', 'verde', 'giallo', 'nero'],
    food: ['pizza', 'pasta', 'gelato', 'caffè', 'vino'],
    animals: ['gatto', 'cane', 'uccello', 'leone', 'elefante'],
    family: ['madre', 'padre', 'sorella', 'fratello', 'nonna'],
    travel: ['aeroporto', 'hotel', 'biglietto', 'valigia', 'passaporto'],
    'common-phrases': ['grazie', 'prego', 'scusa', 'per favore', 'mi dispiace']
  };
  res.json(examples);
});

// 3. Generate Flashcards
app.post('/api/generate-flashcards', async (req, res) => {
  console.log('Received request to generate flashcards');
  console.log('Request body:', req.body);
  
  const { category } = req.body;

  if (!category) {
    console.log('Invalid request: category is required');
    return res.status(400).json({ error: 'Bad Request', message: 'Category is required' });
  }

  try {
    console.log('Processing category:', category);
    const flashcards = [];
    /* Uncomment when AWS credentials are configured
    const bedrockRuntime = getBedrockRuntime();
    */

    // Get category data
    const categoryData = vocabularyData.categories.find(c => c.id === category);
    if (!categoryData) {
      console.log('Category not found:', category);
      return res.status(404).json({ error: 'Category not found' });
    }

    // Generate flashcards for all words in the category
    for (const wordDetails of categoryData.words) {
      console.log('Processing word:', wordDetails.word);
      console.log('Found word details:', wordDetails);

      /* Uncomment when AWS credentials are configured
      // Generate image using Stable Diffusion XL
      const params = {
        modelId: 'stability.stable-diffusion-xl-v1',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          text_prompts: [
            {
              text: `A simple, clear image representing the Italian word "${wordDetails.word}" in the category "${category}"`
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
      const imageUrl = `data:image/png;base64,${responseBody.artifacts[0].base64}`;
      */

      // Use placeholder image for testing
      const imageUrl = `https://placehold.co/512x512/ffffff/000000/png?text=${encodeURIComponent(wordDetails.word)}`;

      flashcards.push({
        word: wordDetails.word,
        translation: wordDetails.translation,
        imageUrl,
        example: wordDetails.example,
        pronunciation: wordDetails.pronunciation
      });
    }

    console.log('Generated flashcards:', flashcards);
    res.json({ flashcards });
  } catch (error) {
    console.error('Error generating flashcards:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to generate flashcards' });
  }
});

// 4. Get Flashcard Details
app.get('/api/flashcard/:word', async (req, res) => {
  const { word } = req.params;
  
  try {
    const wordDetails = await getWordDetails(word);
    res.json(wordDetails);
  } catch (error) {
    console.error('Error getting flashcard details:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to get flashcard details' });
  }
});

// 5. Save Progress
app.post('/api/progress', userLimiter, async (req, res) => {
  const { word, category, status } = req.body;

  if (!word || !category || !status) {
    return res.status(400).json({ error: 'Bad Request', message: 'Missing required fields' });
  }

  try {
    // Here you would typically save to a database
    // For now, we'll just return success
    res.json({
      success: true,
      message: 'Progress saved successfully'
    });
  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to save progress' });
  }
});

// 6. Get User Progress
app.get('/api/progress/:userId', userLimiter, async (req, res) => {
  const { userId } = req.params;

  try {
    // Here you would typically fetch from a database
    // For now, we'll return mock data
    res.json({
      progress: [
        {
          word: 'casa',
          category: 'basic',
          status: 'learned',
          timestamp: new Date().toISOString()
        }
      ]
    });
  } catch (error) {
    console.error('Error getting user progress:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to get user progress' });
  }
});

// Helper function to get word details
async function getWordDetails(word) {
  // In a real application, this would fetch from a dictionary API or database
  // For now, we'll return mock data
  return {
    word,
    translation: 'Translation placeholder',
    example: 'Example sentence placeholder',
    pronunciation: 'Pronunciation placeholder',
    gender: 'masculine/feminine',
    plural: 'plural form'
  };
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 