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
      size = "1024x1024",  // DALL-E 3 default size
      quality = "standard", // 'standard' or 'hd'
      n = 1,              // DALL-E 3 only supports n=1
      promptType = 'flashcard',
      promptParams = {}
    } = options;

    // Validate size
    const validSizes = ["1024x1024", "1792x1024", "1024x1792"];
    if (!validSizes.includes(size) && size !== "1024x1024") {
      console.log(`Invalid size ${size}, using default size 1024x1024`);
      options.size = "1024x1024";
    }

    // Validate quality
    const validQualities = ["standard", "hd"];
    if (!validQualities.includes(quality)) {
      console.log(`Invalid quality ${quality}, using default quality standard`);
      options.quality = "standard";
    }

    // Validate n
    if (n !== 1) {
      console.log('DALL-E 3 only supports n=1, using default value');
      options.n = 1;
    }

    try {
      // Generate prompt using the prompt manager
      const fullPrompt = promptManager.generatePrompt(promptType, this.modelName, promptParams);

      const response = await this.client.images.generate({
        model: this.model,
        prompt: fullPrompt,
        n: options.n,
        size: options.size,
        quality: options.quality
      });

      if (!response.data?.[0]?.url) {
        throw new Error('No image URL in response');
      }

      return response.data[0].url;
    } catch (error) {
      console.error('Error generating image with DALL-E:', error);
      throw error; // Let the model router handle the fallback
    }
  }
}

module.exports = DalleHandler; 