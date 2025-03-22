const express = require('express');
const cors = require('cors');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs').promises;
const modelRouter = require('./models/modelRouter');
const NovaCanvasHandler = require('./models/novaCanvasHandler');
const DalleHandler = require('./models/dalleHandler');
const config = require('./models/config');
require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'OPENAI_API_KEY'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(express.json({ limit: '10mb' })); // Limit request size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Rate limiting middleware
const userLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // 1000 requests per hour
  message: { error: 'Too many requests', message: 'Please try again later' }
});

// Configure AWS
const configureAWS = () => {
  try {
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    });
  } catch (error) {
    console.error('Error configuring AWS:', error);
    throw new Error('Failed to configure AWS');
  }
};

// Create Bedrock Runtime client
const getBedrockRuntime = () => {
  configureAWS();
  return new AWS.BedrockRuntime();
};

// Load vocabulary data with retry mechanism
let vocabularyData = null;
let vocabularyLoadAttempts = 0;
const MAX_LOAD_ATTEMPTS = 3;

async function loadVocabularyData() {
  try {
    const data = await fs.readFile(path.join(__dirname, 'data', 'vocabulary.json'), 'utf8');
    vocabularyData = JSON.parse(data);
    
    // Validate vocabulary data structure
    if (!vocabularyData.categories || !Array.isArray(vocabularyData.categories)) {
      throw new Error('Invalid vocabulary data structure');
    }
    
    console.log('Vocabulary data loaded successfully');
  } catch (error) {
    console.error('Error loading vocabulary data:', error);
    vocabularyLoadAttempts++;
    
    if (vocabularyLoadAttempts < MAX_LOAD_ATTEMPTS) {
      console.log(`Retrying vocabulary data load (attempt ${vocabularyLoadAttempts}/${MAX_LOAD_ATTEMPTS})...`);
      setTimeout(loadVocabularyData, 5000); // Retry after 5 seconds
    } else {
      console.error('Failed to load vocabulary data after maximum attempts');
      vocabularyData = { categories: [] };
    }
  }
}

// Load data on startup
loadVocabularyData();

// Initialize model handlers with error handling
let novaCanvasHandler;
let dalleHandler;

try {
  novaCanvasHandler = new NovaCanvasHandler(process.env.AWS_REGION);
  dalleHandler = new DalleHandler(process.env.OPENAI_API_KEY);
  
  modelRouter.registerModel('nova-canvas', novaCanvasHandler);
  modelRouter.registerModel('dalle', dalleHandler);
  
  console.log('Model handlers initialized successfully');
} catch (error) {
  console.error('Error initializing model handlers:', error);
  process.exit(1);
}

// Input validation middleware
const validateCategory = (req, res, next) => {
  const { category } = req.params;
  if (!category || typeof category !== 'string') {
    return res.status(400).json({ 
      error: 'Bad Request', 
      message: 'Invalid category parameter' 
    });
  }
  next();
};

// Routes with improved error handling
app.get('/api/config/model', (req, res) => {
  try {
    const currentModel = config.getModel();
    const modelConfig = config.getModelConfig(currentModel);
    res.json({
      currentModel,
      availableModels: config.getAvailableModels(),
      config: modelConfig
    });
  } catch (error) {
    console.error('Error getting model configuration:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Failed to get model configuration' 
    });
  }
});

// Add a route to change the model
app.post('/api/config/model', async (req, res) => {
  try {
    const { model } = req.body;
    
    if (!model) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: 'Model name is required' 
      });
    }

    const newModel = config.setModel(model);
    const modelConfig = config.getModelConfig(newModel);

    res.json({
      message: 'Model updated successfully',
      currentModel: newModel,
      config: modelConfig
    });
  } catch (error) {
    console.error('Error changing model:', error);
    res.status(400).json({ 
      error: 'Bad Request', 
      message: error.message 
    });
  }
});

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
    const bedrockRuntime = getBedrockRuntime();

    // Get category data
    const categoryData = vocabularyData.categories.find(c => c.id === category);
    if (!categoryData) {
      console.log('Category not found:', category);
      return res.status(404).json({ error: 'Category not found' });
    }

    // Get current model and its configuration
    const currentModel = config.getModel();
    const modelConfig = config.getModelConfig(currentModel);
    console.log('Using model:', currentModel);

    // Generate flashcards for all words in the category
    for (const wordDetails of categoryData.words) {
      console.log('Generating flashcard for word:', wordDetails.word);
      
      // Generate image using the model router with prompt parameters
      const imageUrl = await modelRouter.generateImage(currentModel, wordDetails.word, {
        promptType: 'flashcard',
        promptParams: {
          word: wordDetails.word,
          category: categoryData.name
        },
        ...modelConfig
      });

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

// Improved error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Bad Request', 
      message: err.message 
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Authentication required' 
    });
  }
  
  // Default error response
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!' 
  });
});

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}); 