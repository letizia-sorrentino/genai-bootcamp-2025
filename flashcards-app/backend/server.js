import express from 'express';
import cors from 'cors';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { promises as fs } from 'fs';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import modelRouter from './models/modelRouter.js';
import NovaCanvasHandler from './models/novaCanvasHandler.js';
import DalleHandler from './models/dalleHandler.js';
import config from './models/config.js';
import imageCache from './models/imageCache.js';
import { connectDB } from './models/database.js';
import Category from './models/Category.js';
import Favorite from './models/Favorite.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Configure dotenv
dotenv.config();

// ES modules __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Flashcards API',
      version: '1.0.0',
      description: 'API documentation for the Flashcards application',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./server.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

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

// Add CSP headers
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://api.openai.com https://bedrock-runtime.us-east-1.amazonaws.com;"
  );
  next();
});

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     description: Retrieve all available categories for flashcards
 *     responses:
 *       200:
 *         description: List of categories
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/categories/{categoryId}:
 *   get:
 *     summary: Get a specific category
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category details
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/words/{categoryId}:
 *   get:
 *     summary: Get words for a category
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of words in the category
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
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
/**
 * @swagger
 * /api/example-words:
 *   get:
 *     summary: Get example words
 *     description: Retrieve example words for different categories
 *     responses:
 *       200:
 *         description: List of example words
 *       500:
 *         description: Server error
 */
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
/**
 * @swagger
 * /api/generate-flashcards:
 *   post:
 *     summary: Generate flashcards
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Generated flashcards
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
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

// Image generation endpoint with improved error handling
/**
 * @swagger
 * /api/generate-image:
 *   post:
 *     summary: Generate image for flashcards
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *               model:
 *                 type: string
 *               options:
 *                 type: object
 *     responses:
 *       200:
 *         description: Generated image URL
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, model, options } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Prompt is required'
      });
    }

    // Validate model if provided
    if (model && !['dalle', 'nova-canvas'].includes(model)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid model specified. Available models: dalle, nova-canvas'
      });
    }

    const imageUrl = await modelRouter.generateImage(model, prompt, options);
    
    res.json({
      success: true,
      imageUrl,
      model: model || process.env.IMAGE_GENERATION_MODEL || 'nova-canvas'
    });
  } catch (error) {
    console.error('Error generating image:', error);
    
    // Handle specific error cases
    if (error.message.includes('not available')) {
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message
      });
    }

    // Handle API key errors
    if (error.message.includes('API key') || error.message.includes('credentials')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid API credentials. Please check your configuration.'
      });
    }

    // Handle rate limiting
    if (error.message.includes('rate limit')) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.'
      });
    }

    // Generic error response
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate image. Please try again later.'
    });
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

// 2. Favorites
/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: Get favorite words
 *     responses:
 *       200:
 *         description: List of favorite words
 *       500:
 *         description: Server error
 *   post:
 *     summary: Add a word to favorites
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               word:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Favorite added successfully
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
app.get('/api/favorites', async (req, res) => {
  try {
    const favorites = await Favorite.find({});
    res.json({ favorites: favorites.map(f => f.word) });
  } catch (error) {
    console.error('Error getting favorites:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Failed to get favorites' 
    });
  }
});

app.post('/api/favorites', async (req, res) => {
  try {
    const { word, category } = req.body;
    
    if (!word || !category) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: 'Word and category are required' 
      });
    }

    // Check if word exists in the specified category
    const categoryData = await Category.findOne({ id: category });
    if (!categoryData) {
      return res.status(404).json({ 
        error: 'Not Found', 
        message: 'Category not found' 
      });
    }

    const wordExists = categoryData.words.some(w => w.word === word);
    if (!wordExists) {
      return res.status(404).json({ 
        error: 'Not Found', 
        message: 'Word not found in category' 
      });
    }

    // Create or update favorite
    const favorite = await Favorite.findOneAndUpdate(
      { word },
      { word, category },
      { upsert: true, new: true }
    );

    res.json({ 
      message: 'Favorite added successfully',
      favorite 
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Failed to add favorite' 
    });
  }
});

app.delete('/api/favorites/:word', async (req, res) => {
  try {
    const { word } = req.params;
    
    const favorite = await Favorite.findOneAndDelete({ word });
    if (!favorite) {
      return res.status(404).json({ 
        error: 'Not Found', 
        message: 'Favorite not found' 
      });
    }

    res.json({ 
      message: 'Favorite removed successfully',
      favorite 
    });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Failed to remove favorite' 
    });
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