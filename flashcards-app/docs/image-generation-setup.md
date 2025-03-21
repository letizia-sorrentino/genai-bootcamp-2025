# Image Generation Setup with Amazon Bedrock

This guide explains how to set up image generation for flashcards using Amazon Bedrock's Stable Diffusion XL and Amazon Titan Image Generator.

## Prerequisites

1. An AWS account with access to Amazon Bedrock
2. AWS CLI installed and configured
3. Appropriate IAM permissions for Bedrock services

## Setup Steps

### 1. AWS Configuration

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
   - Enable model access for Stable Diffusion XL and Amazon Titan Image Generator

### 2. Environment Variables

Add the following to your `.env` file:

```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
```

### 3. Code Implementation

The image generation code is currently commented out in the backend. To enable it:

1. Uncomment the Bedrock code in the generate-flashcards endpoint
2. Replace the placeholder image URLs with the generated ones

Example implementation:

```javascript
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION });

async function generateImage(prompt) {
  const input = {
    modelId: "stability.stable-diffusion-xl",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      text_prompts: [{ text: prompt }],
      cfg_scale: 10,
      steps: 50,
      seed: 0,
    }),
  };

  try {
    const command = new InvokeModelCommand(input);
    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    return responseBody.artifacts[0].base64;
  } catch (error) {
    console.error('Error generating image:', error);
    return null;
  }
}
```

### 4. Usage

When generating flashcards, create an image prompt based on the word and its context:

```javascript
const imagePrompt = `A clear, simple illustration of ${word} in ${category} context`;
const imageBase64 = await generateImage(imagePrompt);
const imageUrl = imageBase64 ? `data:image/png;base64,${imageBase64}` : defaultImageUrl;
```

## Best Practices

1. **Error Handling**: Always have a fallback image URL in case generation fails
2. **Rate Limiting**: Implement rate limiting to manage API costs
3. **Caching**: Cache generated images to avoid regenerating the same images
4. **Prompt Engineering**: Create clear, consistent prompts for better results

## Cost Considerations

- Monitor your Bedrock usage to manage costs
- Consider implementing caching to reduce API calls
- Use appropriate image generation parameters (steps, cfg_scale) to balance quality and cost

## Security Notes

1. Never commit AWS credentials to version control
2. Use environment variables for sensitive information
3. Implement proper access controls and IAM roles
4. Monitor and audit Bedrock usage regularly

## Troubleshooting

Common issues and solutions:

1. **Authentication Errors**:
   - Verify AWS credentials are correct
   - Check IAM permissions
   - Ensure environment variables are properly set

2. **Generation Failures**:
   - Check prompt formatting
   - Verify model availability in your region
   - Monitor AWS service health

3. **Performance Issues**:
   - Implement request queuing
   - Add timeout handling
   - Consider using smaller image sizes

## Additional Resources

- [Amazon Bedrock Documentation](https://docs.aws.amazon.com/bedrock)
- [Stable Diffusion XL Guide](https://stability.ai/stable-diffusion)
- [AWS SDK Documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/) 