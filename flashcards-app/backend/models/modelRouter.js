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
    const model = this.models.get(modelName) || this.models.get(this.defaultModel);
    if (!model) {
      throw new Error(`Model ${modelName} not found`);
    }
    return model.generateImage(prompt, options);
  }
}

// Create singleton instance
const modelRouter = new ModelRouter();

module.exports = modelRouter; 