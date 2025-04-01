const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const promptManager = require('./prompts');

class NovaCanvasHandler {
  constructor(region) {
    this.client = new BedrockRuntimeClient({ region });
    this.modelId = "amazon.nova-canvas-v1:0";
    this.modelName = 'nova-canvas';
  }

  async generateImage(prompt, options = {}) {
    const {
      size = "1024x1024",  // Default size for high quality images
      quality = "standard",
      n = 1,
      promptType = 'flashcard',
      promptParams = {}
    } = options;

    try {
      // Generate prompt using the prompt manager
      const generatedPrompt = promptManager.generatePrompt(promptType, this.modelName, promptParams);

      const input = {
        modelId: this.modelId,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
          textToImageParams: {
            text: generatedPrompt
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
      
      // Check if the response has the expected structure
      if (!responseBody || !responseBody.images || !responseBody.images[0]) {
        console.error('Unexpected response format:', responseBody);
        throw new Error('Invalid response format from Nova Canvas API');
      }

      // Nova Canvas returns the image directly in base64 format
      return `data:image/png;base64,${responseBody.images[0]}`;
    } catch (error) {
      console.error('Error generating image with Nova Canvas:', error);
      throw error; // Let the model router handle the fallback
    }
  }
}

module.exports = NovaCanvasHandler; 