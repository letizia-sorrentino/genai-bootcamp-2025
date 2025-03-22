# Image Generation Setup for Flashcards

This guide explains how to set up image generation for flashcards using either Amazon Bedrock's Nova Canvas or OpenAI's DALL-E 3 model.

## Prerequisites

1. For Amazon Bedrock:
   - AWS account with access to Amazon Bedrock
   - AWS CLI installed and configured
   - Appropriate IAM permissions for Bedrock services

2. For OpenAI:
   - OpenAI API key
   - OpenAI account with access to DALL-E 3

## Setup Steps

### 1. AWS Configuration (for Nova Canvas)

1. Configure your AWS credentials:
   ```bash
   aws configure
   ```
   Enter your:
   - AWS Access Key ID
   - AWS Secret Access Key
   - Default region (e.g., us-east-1)
   - Default output format (json)

2. Ensure Bedrock access is enabled in your AWS account:
   - Go to AWS Console
   - Navigate to Amazon Bedrock
   - Enable model access for Nova Canvas

### 2. Environment Variables

Add the following to your `.env` file:

```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Image Generation Configuration
IMAGE_GENERATION_MODEL=nova-canvas  # Options: 'nova-canvas' or 'dalle'
```

### 3. Model Router System

The application uses a model router system to manage different image generation models. This allows for easy switching between models and adding new ones in the future.

#### Model Router Structure

```javascript
// models/modelRouter.js
class ModelRouter {
  constructor() {
    this.models = new Map();
  }

  registerModel(name, handler) {
    this.models.set(name, handler);
  }

  async generateImage(modelName, prompt, options = {}) {
    const handler = this.models.get(modelName);
    if (!handler) {
      throw new Error(`Model ${modelName} not found`);
    }
    return handler.generateImage(prompt, options);
  }
}
```

### 4. Model Handlers

#### Nova Canvas Handler

```javascript
// models/novaCanvasHandler.js
class NovaCanvasHandler {
  constructor(region) {
    if (!region) {
      throw new Error('AWS region is required');
    }
    this.client = new BedrockRuntimeClient({ region });
    this.modelId = "amazon.nova-canvas-v1:0";
    this.modelName = 'nova-canvas';
  }

  async generateImage(prompt, options = {}) {
    const {
      size = "256x256",  // Smaller default size for flashcards
      quality = "standard",
      n = 1,
      promptType = 'flashcard',
      promptParams = {}
    } = options;

    try {
      // Generate prompt using the prompt manager
      const generatedPrompt = promptManager.generatePrompt(promptType, this.modelName, promptParams);
      const promptConfig = promptManager.getPromptConfig(promptType, this.modelName);

      const input = {
        modelId: this.modelId,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
          textToImageParams: {
            text: generatedPrompt,
            style: promptConfig.style,
            negativePrompt: promptConfig.negativePrompt
          },
          taskType: "TEXT_IMAGE",
          imageGenerationConfig: {
            cfgScale: 8,
            seed: Math.floor(Math.random() * 1000000),
            quality,
            width: parseInt(size.split('x')[0]),
            height: parseInt(size.split('x')[1]),
            numberOfImages: n
          }
        })
      };

      const command = new InvokeModelCommand(input);
      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      return `data:image/png;base64,${responseBody.artifacts[0].base64}`;
    } catch (error) {
      console.error('Error generating image with Nova Canvas:', error);
      return `https://placehold.co/${size}/ffffff/000000/png?text=${encodeURIComponent(prompt)}`;
    }
  }
}
```

#### DALL-E Handler

```javascript
// models/dalleHandler.js
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
      return `https://placehold.co/${size}/ffffff/000000/png?text=${encodeURIComponent(prompt)}`;
    }
  }
}
```

### 5. Prompt Management

The application uses a centralized prompt management system with model-specific prompts:

```javascript
// models/prompts.js
class PromptManager {
  constructor() {
    this.prompts = {
      'flashcard': {
        'nova-canvas': {
          template: 'Create a clear, educational illustration for a language learning flashcard. The image should represent the Italian word "{word}" in the context of "{category}". The style should be minimalist and suitable for educational purposes.',
          style: 'minimalist, clean, educational, professional illustration',
          negativePrompt: 'complex, cluttered, inappropriate, text, watermark, blurry, low quality, photorealistic, photograph'
        },
        'dalle': {
          template: 'Create a clear, educational illustration for a language learning flashcard. The image should represent the Italian word "{word}" in the context of "{category}". The image should be minimalist, clean, and educational, with a professional illustration style that is clear and easy to understand. Avoid complex or cluttered scenes, inappropriate content, text or watermarks, blurry or low quality images, photorealistic or photographic styles.'
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
    // Only return style and negativePrompt for Nova Canvas
    if (model === 'nova-canvas') {
      const modelPrompts = this.prompts[promptType][model];
      return {
        style: modelPrompts.style,
        negativePrompt: modelPrompts.negativePrompt
      };
    }
    return {};
  }
}
```

### 6. Model Configuration

The application includes a configuration manager to handle model settings:

```javascript
// models/config.js
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
        size: '1024x1024',
        quality: 'standard',
        style: 'vivid'
      }
    };
    return configs[model] || configs[this.defaultModel];
  }

  getAvailableModels() {
    return this.availableModels;
  }
}
```

## Usage

### 1. Generate Flashcards

```javascript
// Example usage in server.js
const imageUrl = await modelRouter.generateImage(currentModel, word, {
  promptType: 'flashcard',
  promptParams: {
    word: word,
    category: category
  }
});
```

### 2. Change Model Configuration

```bash
# Get current model configuration
curl http://localhost:3000/api/config/model

# Change the model
curl -X POST http://localhost:3000/api/config/model \
  -H "Content-Type: application/json" \
  -d '{"model": "dalle"}'
```

## Model-Specific Features

### Nova Canvas
- Supports negative prompts
- Configurable CFG scale (default: 8)
- Customizable image dimensions
- Multiple image generation in one request
- Default size: 256x256 (optimized for flashcards)
- Returns base64-encoded images
- Fallback to placeholder images on error

### DALL-E 3
- Higher resolution output (1024x1024, 1792x1024, or 1024x1792)
- Improved prompt understanding
- Better quality for complex scenes
- Built-in style control ('vivid' or 'natural')
- Quality options ('standard' or 'hd')
- Single image generation only (n=1)
- Returns direct URLs to generated images
- Fallback to placeholder images on error

## Best Practices

1. **Error Handling**: 
   - Always have a fallback image URL in case generation fails
   - Validate all inputs before making API calls
   - Handle API errors gracefully
   - Log errors for debugging
   - Use placeholder images as fallback

2. **Rate Limiting**: 
   - Implement rate limiting to manage API costs
   - Monitor API usage
   - Set appropriate limits for your use case
   - Consider implementing request queuing

3. **Caching**: 
   - Cache generated images to avoid regenerating the same images
   - Implement cache invalidation strategy
   - Consider using CDN for better performance
   - Store both successful and failed generations

4. **Prompt Engineering**: 
   - Create clear, consistent prompts for better results
   - Use model-specific prompt formats
   - Test prompts with different words and categories
   - Include context in prompts

5. **Model Selection**: 
   - Choose based on cost considerations
   - Consider quality requirements
   - Check API availability
   - Consider response time needs
   - Evaluate image size requirements

## Cost Considerations

### Nova Canvas
- Monitor your Bedrock usage to manage costs
- Consider implementing caching to reduce API calls
- Use appropriate image generation parameters
- Smaller image sizes (256x256) for better cost efficiency
- Multiple images per request for batch processing

### DALL-E 3
- Monitor token usage and image generation costs
- Implement caching to avoid regenerating the same images
- Use appropriate quality settings
- Consider using standard quality for better cost efficiency
- Higher resolution means higher costs

## Security Notes

1. Never commit API keys or credentials to version control
2. Use environment variables for sensitive information
3. Implement proper access controls
4. Monitor and audit API usage regularly
5. Rotate API keys periodically
6. Validate all user inputs
7. Implement rate limiting
8. Use secure headers and CORS policies
9. Sanitize prompts to prevent injection attacks
10. Implement proper error handling to avoid information leakage

## Troubleshooting

Common issues and solutions:

1. **Authentication Errors**:
   - Verify API keys and credentials are correct
   - Check service permissions
   - Ensure environment variables are properly set
   - Validate AWS region configuration
   - Check token expiration

2. **Generation Failures**:
   - Check prompt formatting
   - Verify model availability
   - Monitor service health
   - Check input validation errors
   - Verify rate limits

3. **Performance Issues**:
   - Implement request queuing
   - Add timeout handling
   - Use appropriate image sizes
   - Consider caching strategies
   - Monitor response times

4. **Validation Errors**:
   - Check parameter types
   - Verify required fields
   - Validate image sizes
   - Check model-specific constraints
   - Validate prompt parameters

## Additional Resources

- [Amazon Bedrock Documentation](https://docs.aws.amazon.com/bedrock)
- [Nova Canvas Documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-nova-canvas.html)
- [OpenAI DALL-E Documentation](https://platform.openai.com/docs/guides/images)
- [AWS SDK Documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [Express.js Documentation](https://expressjs.com/)
- [Node.js Documentation](https://nodejs.org/docs/) 