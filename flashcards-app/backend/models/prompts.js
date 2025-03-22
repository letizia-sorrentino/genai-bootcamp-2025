class PromptManager {
  constructor() {
    this.prompts = {
      'flashcard': {
        'nova-canvas': {
          template: 'Create a clear, educational illustration for a language learning flashcard. The image should represent the Italian word "{word}". The style should be minimalist and suitable for educational purposes.',
          style: 'minimalist, clean, educational, professional illustration',
          negativePrompt: 'complex, cluttered, inappropriate, text, watermark, blurry, low quality, photorealistic, photograph'
        },
        'dalle': {
          template: 'Create a clear, educational illustration for a language learning flashcard. The image should represent the Italian word "{word}". The image should be minimalist, clean, and educational, with a professional illustration style that is clear and easy to understand. Avoid complex or cluttered scenes, inappropriate content, text or watermarks, blurry or low quality images, photorealistic or photographic styles.'
        }
      }
    };
  }

  generatePrompt(promptType, model, params) {
    // Validate prompt type and model
    if (!this.prompts[promptType]) {
      throw new Error(`Invalid prompt type: ${promptType}. Available types: ${Object.keys(this.prompts).join(', ')}`);
    }
    if (!this.prompts[promptType][model]) {
      throw new Error(`Invalid model: ${model}. Available models for ${promptType}: ${Object.keys(this.prompts[promptType]).join(', ')}`);
    }

    const modelPrompts = this.prompts[promptType][model];
    let prompt = modelPrompts.template;

    // Validate required parameters
    const requiredParams = prompt.match(/\{(\w+)\}/g)?.map(p => p.slice(1, -1)) || [];
    const missingParams = requiredParams.filter(param => !(param in params));
    
    if (missingParams.length > 0) {
      throw new Error(`Missing required parameters: ${missingParams.join(', ')}`);
    }

    // Replace parameters in template
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) {
        throw new Error(`Parameter ${key} cannot be undefined or null`);
      }
      prompt = prompt.replace(`{${key}}`, value);
    }

    return prompt;
  }

  getPromptConfig(promptType, model) {
    // Validate prompt type and model
    if (!this.prompts[promptType]) {
      throw new Error(`Invalid prompt type: ${promptType}. Available types: ${Object.keys(this.prompts).join(', ')}`);
    }
    if (!this.prompts[promptType][model]) {
      throw new Error(`Invalid model: ${model}. Available models for ${promptType}: ${Object.keys(this.prompts[promptType]).join(', ')}`);
    }

    const modelPrompts = this.prompts[promptType][model];

    // Only return style and negativePrompt for Nova Canvas
    if (model === 'nova-canvas') {
      return {
        style: modelPrompts.style,
        negativePrompt: modelPrompts.negativePrompt
      };
    }
    return {};
  }
}

module.exports = new PromptManager(); 