class ImageCache {
  constructor() {
    this.cache = new Map();
  }

  get(word) {
    return this.cache.get(word);
  }

  set(word, imageUrl) {
    this.cache.set(word, imageUrl);
  }

  has(word) {
    return this.cache.has(word);
  }

  clear() {
    this.cache.clear();
  }
}

module.exports = new ImageCache(); 