const fs = require('fs').promises;
const path = require('path');

const vocabularyPath = path.join(__dirname, '../data/vocabulary.json');

const getCategories = async () => {
  try {
    const data = await fs.readFile(vocabularyPath, 'utf8');
    return JSON.parse(data).categories || [];
  } catch (error) {
    console.error('Error reading vocabulary data:', error);
    return [];
  }
};

const updateCategory = async (categoryName, words) => {
  try {
    const data = JSON.parse(await fs.readFile(vocabularyPath, 'utf8'));
    const categoryIndex = data.categories.findIndex(cat => cat.name === categoryName);
    
    if (categoryIndex >= 0) {
      data.categories[categoryIndex].words = words;
    } else {
      data.categories.push({ name: categoryName, words });
    }
    
    await fs.writeFile(vocabularyPath, JSON.stringify(data, null, 2));
    return data.categories;
  } catch (error) {
    console.error('Error updating category:', error);
    return null;
  }
};

module.exports = {
  getCategories,
  updateCategory
}; 