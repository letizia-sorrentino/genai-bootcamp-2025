const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Category = require('../models/Category');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flashcards', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

async function loadVocabularyData() {
  // 1. Read from JSON file
  const data = await fs.readFile(path.join(__dirname, 'data', 'vocabulary.json'), 'utf8');
  const vocabularyData = JSON.parse(data);
  
  // 2. Save to MongoDB
  for (const category of vocabularyData.categories) {
    await Category.findOneAndUpdate(
      { id: category.id },
      category,
      { upsert: true, new: true }
    );
  }
}

const wordSchema = new mongoose.Schema({
  word: { type: String, required: true },
  translation: { type: String, required: true },
  example: String,
  pronunciation: String,
  gender: String,
  plural: String
});

module.exports = connectDB; 