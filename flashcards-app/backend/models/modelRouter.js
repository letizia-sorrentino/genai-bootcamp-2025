const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

class ModelRouter {
  constructor() {
    this.models = new Map();
    this.defaultModel = 'nova-canvas';
  }

  registerModel(name, handler) {
    this.models.set(name, handler);
  }

  async generateImage(modelName, prompt, options = {}) {
    // Try DALL-E first
    const dalleModel = this.models.get('dalle');
    if (dalleModel) {
      try {
        console.log('Attempting to generate image with DALL-E');
        const imageUrl = await dalleModel.generateImage(prompt, options);
        if (imageUrl) {
          console.log('Successfully generated image with DALL-E');
          return imageUrl;
        }
      } catch (error) {
        console.error('DALL-E generation failed:', error);
      }
    }

    // Fall back to Nova Canvas
    const novaModel = this.models.get('nova-canvas');
    if (novaModel) {
      try {
        console.log('Falling back to Nova Canvas');
        const imageUrl = await novaModel.generateImage(prompt, options);
        if (imageUrl) {
          console.log('Successfully generated image with Nova Canvas');
          return imageUrl;
        }
      } catch (error) {
        console.error('Nova Canvas generation failed:', error);
      }
    }

    // If both models fail, return a placeholder
    console.log('Both models failed, returning placeholder');
    return `https://placehold.co/256x256/ffffff/000000/png?text=${encodeURIComponent(prompt)}`;
  }
}

// Create singleton instance
const modelRouter = new ModelRouter();

module.exports = modelRouter; 