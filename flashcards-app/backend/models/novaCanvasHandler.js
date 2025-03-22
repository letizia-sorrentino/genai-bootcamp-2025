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
      size = "256x256",  // Smaller default size for flashcards
      quality = "standard",
      n = 1,
      promptType = 'flashcard',
      promptParams = {}
    } = options;

    try {
      // Generate prompt using the prompt manager with model-specific configuration
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

module.exports = NovaCanvasHandler; 