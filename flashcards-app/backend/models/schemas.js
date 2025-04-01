const mongoose = require('mongoose');

const wordSchema = new mongoose.Schema({
  italian: String,
  english: String,
  example: String,
  imageUrl: String,
  category: String
});

const categorySchema = new mongoose.Schema({
  name: String,
  words: [wordSchema]
});

const favoriteSchema = new mongoose.Schema({
  userId: String, // For future user implementation
  words: [wordSchema]
});

const userProgressSchema = new mongoose.Schema({
  userId: String,
  wordId: String,
  correct: Number,
  incorrect: Number,
  lastReviewed: Date
});

const Category = mongoose.model('Category', categorySchema);
const Favorite = mongoose.model('Favorite', favoriteSchema);
const UserProgress = mongoose.model('UserProgress', userProgressSchema);

module.exports = {
  Category,
  Favorite,
  UserProgress
}; 