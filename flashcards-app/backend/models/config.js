class ConfigManager {
  constructor() {
    this.defaultModel = process.env.IMAGE_GENERATION_MODEL || 'nova-canvas';
    this.availableModels = ['nova-canvas', 'dalle'];
    this.currentModel = this.defaultModel;
  }

  getModel() {
    return this.currentModel;
  }

  setModel(model) {
    if (!this.availableModels.includes(model)) {
      throw new Error(`Invalid model: ${model}. Available models: ${this.availableModels.join(', ')}`);
    }
    this.currentModel = model;
    console.log(`Model changed to: ${model}`);
    return model;
  }

  getModelConfig(model) {
    const configs = {
      'nova-canvas': {
        size: '256x256',
        quality: 'standard'
      },
      'dalle': {
        size: '512x512',
        quality: 'standard'
      }
    };
    return configs[model] || configs[this.defaultModel];
  }

  getAvailableModels() {
    return this.availableModels;
  }
}

module.exports = new ConfigManager(); 