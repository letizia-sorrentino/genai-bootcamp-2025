const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const Category = require('../models/Category');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Fallback to file-based system if MongoDB fails
    console.log('Falling back to file-based system');
  }
};

const loadVocabularyData = async () => {
  try {
    const filePath = path.join(__dirname, '../data/vocabulary.json');
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading vocabulary data:', error);
    return { categories: [] };
  }
};

const wordSchema = new mongoose.Schema({
  word: { type: String, required: true },
  translation: { type: String, required: true },
  example: String,
  pronunciation: String,
  gender: String,
  plural: String
});

module.exports = { connectDB, loadVocabularyData }; 