class PromptManager {
  constructor() {
    this.prompts = {
      'flashcard': {
        'nova-canvas': {
          template: 'Create a clear, educational illustration. The image should represent the Italian word "{word}". The style should be minimalist and suitable for educational purposes.',          style: 'minimalist, clean, educational, professional illustration',
          negativePrompt: 'complex, cluttered, inappropriate, text, watermark, blurry, low quality, photorealistic, photograph'
        },
        'dalle': {
          template: 'Illustrate the concept of the Italian word “{word}” using a clean and minimalistic vector image. The image must not contain any text, characters, or writing — not even subtle or decorative ones. Use only visual storytelling appropriate for beginners learning Italian. Apply a flat, colourful style with a white background and easy-to-recognise shapes.',
          negativePrompt: 'text, letters, words, numbers, writing, handwriting, symbols, subtitles, captions',
        }
      }
    };
  }

  generatePrompt(promptType, model, params) {
    try {
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
    } catch (error) {
      console.error('Error generating prompt:', error);
      throw error;
    }
  }

  getPromptConfig(promptType, model) {
    try {
      // Validate prompt type and model
      if (!this.prompts[promptType]) {
        throw new Error(`Invalid prompt type: ${promptType}. Available types: ${Object.keys(this.prompts).join(', ')}`);
      }
      if (!this.prompts[promptType][model]) {
        throw new Error(`Invalid model: ${model}. Available models for ${promptType}: ${Object.keys(this.prompts[promptType]).join(', ')}`);
      }

      const modelPrompts = this.prompts[promptType][model];
      return {
        style: modelPrompts.style,
        negativePrompt: modelPrompts.negativePrompt
      };
    } catch (error) {
      console.error('Error getting prompt config:', error);
      throw error;
    }
  }
}

module.exports = new PromptManager(); 