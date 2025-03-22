const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  word: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp before saving
favoriteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite; 