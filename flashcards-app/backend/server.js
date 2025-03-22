const express = require('express');
const cors = require('cors');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs').promises;
const modelRouter = require('./models/modelRouter');
const NovaCanvasHandler = require('./models/novaCanvasHandler');
const DalleHandler = require('./models/dalleHandler');
const config = require('./models/config');
const imageCache = require('./models/imageCache');
const connectDB = require('./models/database');
const Category = require('./models/Category');
const Favorite = require('./models/Favorite');
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

// Connect to MongoDB
connectDB();

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

// Create Bedrock Runtime client
const getBedrockRuntime = () => {
  try {
    return new BedrockRuntimeClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
  } catch (error) {
    console.error('Error creating Bedrock Runtime client:', error);
    throw new Error('Failed to create Bedrock Runtime client');
  }
};

// Load vocabulary data with retry mechanism
let vocabularyLoadAttempts = 0;
const MAX_LOAD_ATTEMPTS = 3;

async function loadVocabularyData() {
  try {
    const data = await fs.readFile(path.join(__dirname, 'data', 'vocabulary.json'), 'utf8');
    const vocabularyData = JSON.parse(data);
    
    // Validate vocabulary data structure
    if (!vocabularyData.categories || !Array.isArray(vocabularyData.categories)) {
      throw new Error('Invalid vocabulary data structure');
    }

    // Save categories to database
    for (const category of vocabularyData.categories) {
      const result = await Category.findOneAndUpdate(
        { id: category.id },
        category,
        { upsert: true, new: true }
      );
      console.log(`Loaded category: ${category.id}`);
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
app.get('/api/categories', async (req, res) => {
  try {
    // Get all categories from database
    const categories = await Category.find({});
    
    // Get favorites
    const favorites = await Favorite.find({});
    const favoriteWords = favorites.map(f => f.word);

    // Create favorites category
    const favoritesCategory = {
      id: 'favorites',
      name: 'Favorites',
      description: 'Your favorite words',
      words: []
    };

    // Add word details to favorites category
    for (const word of favoriteWords) {
      for (const category of categories) {
        const wordDetails = category.words.find(w => w.word === word);
        if (wordDetails) {
          favoritesCategory.words.push(wordDetails);
          break;
        }
      }
    }

    // Combine favorites with other categories
    const categoriesWithFavorites = {
      categories: [favoritesCategory, ...categories]
    };

    res.json(categoriesWithFavorites);
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Failed to get categories' 
    });
  }
});

app.get('/api/categories/:categoryId', async (req, res) => {
  try {
    const category = await Category.findOne({ id: req.params.categoryId });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('Error getting category:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Failed to get category' 
    });
  }
});

app.get('/api/words/:categoryId', async (req, res) => {
  try {
    const category = await Category.findOne({ id: req.params.categoryId });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ words: category.words });
  } catch (error) {
    console.error('Error getting words:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Failed to get words' 
    });
  }
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

// 3. Generate Flashcards (Modified to only return words and translations)
app.post('/api/generate-flashcards', async (req, res) => {
  try {
    const { category } = req.body;
    
    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    // Get words for the category
    const categoryData = await Category.findOne({ id: category });
    if (!categoryData) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const words = categoryData.words;
    
    // Generate flashcards with placeholder images
    const flashcards = words.map(word => ({
      word: word.word,
      translation: word.translation,
      category: categoryData.name,
      imageUrl: `https://placehold.co/600x400/4a90e2/ffffff?text=${encodeURIComponent(categoryData.name)}`
    }));

    res.json({ flashcards });
  } catch (error) {
    console.error('Error generating flashcards:', error);
    res.status(500).json({ error: 'Failed to generate flashcards' });
  }
});

// Image generation endpoint
app.post('/api/generate-image', async (req, res) => {
  try {
    const { word, category } = req.body;
    
    if (!word) {
      return res.status(400).json({ error: 'Word is required' });
    }

    // Check cache first
    const cacheKey = `${word}-${category || 'default'}`;
    if (imageCache.has(cacheKey)) {
      return res.json({ imageUrl: imageCache.get(cacheKey) });
    }

    // Return a placeholder image with the category name
    const placeholderUrl = `https://placehold.co/600x400/4a90e2/ffffff?text=${encodeURIComponent(category || 'Flashcard')}`;
    
    // Cache the placeholder
    imageCache.set(cacheKey, placeholderUrl);
    
    res.json({ imageUrl: placeholderUrl });
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: 'Failed to generate image' });
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

// Favorites endpoints
app.post('/api/favorites', userLimiter, async (req, res) => {
  const { word, category } = req.body;

  if (!word || !category) {
    return res.status(400).json({ error: 'Bad Request', message: 'Word and category are required' });
  }

  try {
    // Check if word exists in the category
    const categoryData = await Category.findOne({ id: category });
    if (!categoryData || !categoryData.words.some(w => w.word === word)) {
      return res.status(404).json({ error: 'Word not found in category' });
    }

    // Add to favorites
    await Favorite.findOneAndUpdate(
      { word },
      { word, category },
      { upsert: true, new: true }
    );

    // Get updated favorites list
    const favorites = await Favorite.find({});
    
    res.json({
      success: true,
      message: 'Word added to favorites',
      favorites: favorites.map(f => f.word)
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to add to favorites' });
  }
});

app.delete('/api/favorites/:word', userLimiter, async (req, res) => {
  const { word } = req.params;

  if (!word) {
    return res.status(400).json({ error: 'Bad Request', message: 'Word is required' });
  }

  try {
    // Remove from favorites
    await Favorite.findOneAndDelete({ word });

    // Get updated favorites list
    const favorites = await Favorite.find({});
    
    res.json({
      success: true,
      message: 'Word removed from favorites',
      favorites: favorites.map(f => f.word)
    });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to remove from favorites' });
  }
});

app.get('/api/favorites', userLimiter, async (req, res) => {
  try {
    const favorites = await Favorite.find({});
    res.json({
      favorites: favorites.map(f => f.word),
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error getting favorites:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to get favorites' });
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