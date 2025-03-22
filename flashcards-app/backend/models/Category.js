const mongoose = require('mongoose');

const wordSchema = new mongoose.Schema({
  word: { type: String, required: true },
  translation: { type: String, required: true },
  example: String,
  pronunciation: String,
  gender: String,
  plural: String
});

const categorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  words: [wordSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp before saving
categorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category; 