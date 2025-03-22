const OpenAI = require('openai');
const promptManager = require('./prompts');

class DalleHandler {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    this.client = new OpenAI({ apiKey });
    this.model = "dall-e-3";
    this.modelName = 'dalle';
  }

  async generateImage(prompt, options = {}) {
    const {
      size = "1024x1024",  // DALL-E 3 supports 1024x1024, 1792x1024, or 1024x1792
      quality = "standard", // 'standard' or 'hd'
      n = 1,              // DALL-E 3 only supports n=1
      promptType = 'flashcard',
      promptParams = {}
    } = options;

    // Validate size
    const validSizes = ["1024x1024", "1792x1024", "1024x1792"];
    if (!validSizes.includes(size)) {
      throw new Error(`Invalid size: ${size}. Valid sizes are: ${validSizes.join(', ')}`);
    }

    // Validate quality
    const validQualities = ["standard", "hd"];
    if (!validQualities.includes(quality)) {
      throw new Error(`Invalid quality: ${quality}. Valid qualities are: ${validQualities.join(', ')}`);
    }

    // Validate n
    if (n !== 1) {
      throw new Error('DALL-E 3 only supports generating one image at a time (n=1)');
    }

    try {
      // Generate prompt using the prompt manager
      const fullPrompt = promptManager.generatePrompt(promptType, this.modelName, promptParams);

      const response = await this.client.images.generate({
        model: this.model,
        prompt: fullPrompt,
        n: n,
        size: size,
        quality: quality
      });

      if (!response.data?.[0]?.url) {
        throw new Error('No image URL in response');
      }

      return response.data[0].url;
    } catch (error) {
      console.error('Error generating image with DALL-E:', error);
      // Return a placeholder image with the word as text
      return `https://placehold.co/${size}/ffffff/000000/png?text=${encodeURIComponent(prompt)}`;
    }
  }
}

module.exports = DalleHandler; 