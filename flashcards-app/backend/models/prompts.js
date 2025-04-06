class PromptManager {
  constructor() {
    this.prompts = {
      'flashcard': {
        'nova-canvas': {
          // Default template for concrete objects
          template: 'Create a high-quality, realistic photograph representing {word}. The image should be clear, well-lit, and focused on the main subject. Use natural lighting and a clean background. The photo should be professional and educational in nature, suitable for learning purposes.',
          // Template for abstract concepts
          abstract: 'Create an evocative scene that symbolizes the concept of {word} in Italian culture. Use meaningful visual metaphors and cultural elements to convey the meaning. The image should be rich in symbolism while remaining clear and educational.',
          style: 'professional photography, high resolution, clear focus, natural lighting, realistic image, authentic Italian setting',
          negativePrompt: 'text, letters, words, numbers, writing, handwriting, symbols, watermark, signature, label, caption, subtitle, cartoon, illustration, vector art, drawing, sketch, animation'
        },
        'dalle': {
          // Default template for concrete objects
          template: 'A professional, high-quality photograph of {word}. The image should be crisp and clear, shot in natural lighting with a clean, uncluttered background. Focus on creating a realistic, educational representation with excellent detail and composition. No text or labels should be present.',
          // Template for abstract concepts
          abstract: 'A meaningful scene that represents the concept of {word} in Italian culture. Create a rich visual metaphor using cultural elements and symbolism. The image should be evocative and clear without using any text or labels.',
          negativePrompt: 'text, letters, alphabet, words, numbers, writing, handwriting, calligraphy, fonts, characters, symbols, subtitles, captions, labels, watermarks, signatures, cartoon, illustration, vector art, drawing'
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
      let prompt;

      // Select appropriate template based on word category
      if (params.category) {
        switch (params.category.toLowerCase()) {
          case 'abstract':
            prompt = modelPrompts.abstract;
            break;
          default:
            prompt = modelPrompts.template;
        }
      } else {
        prompt = modelPrompts.template;
      }

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