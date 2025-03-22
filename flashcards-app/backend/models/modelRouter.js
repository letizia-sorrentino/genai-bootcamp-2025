const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

class ModelRouter {
  constructor() {
    this.models = new Map();
    this.defaultModel = process.env.IMAGE_GENERATION_MODEL || 'nova-canvas';
  }

  registerModel(name, handler) {
    this.models.set(name, handler);
  }

  async generateImage(modelName, prompt, options = {}) {
    // Use provided model or default
    const targetModel = modelName || this.defaultModel;
    const model = this.models.get(targetModel);

    if (!model) {
      console.error(`Model ${targetModel} not found`);
      throw new Error(`Model ${targetModel} not available`);
    }

    try {
      console.log(`Attempting to generate image with ${targetModel}`);
      const imageUrl = await model.generateImage(prompt, options);
      if (imageUrl) {
        console.log(`Successfully generated image with ${targetModel}`);
        return imageUrl;
      }
    } catch (error) {
      console.error(`${targetModel} generation failed:`, error);
      
      // If the target model fails and it's not the default, try the default model
      if (targetModel !== this.defaultModel) {
        const defaultModel = this.models.get(this.defaultModel);
        if (defaultModel) {
          try {
            console.log(`Falling back to default model ${this.defaultModel}`);
            const fallbackImageUrl = await defaultModel.generateImage(prompt, options);
            if (fallbackImageUrl) {
              console.log(`Successfully generated image with ${this.defaultModel}`);
              return fallbackImageUrl;
            }
          } catch (fallbackError) {
            console.error(`${this.defaultModel} fallback failed:`, fallbackError);
          }
        }
      }
    }

    // If all attempts fail, throw an error
    throw new Error('Failed to generate image with any available model');
  }
}

// Create singleton instance
const modelRouter = new ModelRouter();

module.exports = modelRouter; 