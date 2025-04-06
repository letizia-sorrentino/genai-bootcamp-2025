# Italian Flashcards App

A mobile-first web application for learning Italian through interactive flashcards, featuring AI-powered image generation and personalized learning experiences. Designed for seamless learning across all devices.

## Features

### Core Learning Experience
- Mobile-first design
- Interactive flashcard interface
- Responsive design that adapts to all screen sizes

### AI-Powered Features
- AI-generated illustrations for each vocabulary word
- Contextual examples and explanations
- Support for multiple AI models (AWS Bedrock and OpenAI)
- Consistent, educational-style image generation

### Personalization
- Save and organize favorite flashcards
- Access favorite cards in a dedicated category
- Browser-based storage for immediate access
- Personalized learning collection

## Tech Stack

### Frontend
- React 19
- Vite
- React Router DOM
- Axios for API communication
- React Icons for UI elements

### Backend
- Node.js with Express
- AWS Bedrock for AI features
- OpenAI integration
- Rate limiting and security features

## AI Image Generation

The application uses advanced AI models to generate educational illustrations for each vocabulary word. Features include:

- **Multiple Model Support**: Switch between AWS Bedrock and OpenAI models
- **Consistent Style**: Maintains educational, minimalist illustration style
- **Quality Control**: Implements negative prompts to avoid unwanted elements
- **Error Handling**: Robust error management for API failures

### Model Router

The application uses a flexible model router system that allows switching between different AI models for content generation. Currently supported models:

- **Nova Canvas**: AWS Bedrock-based model for generating contextual examples and explanations
- **DALL-E**: OpenAI's model for generating visual aids and illustrations

The model router provides a unified interface for all AI operations, making it easy to:
- Switch between different models at runtime
- Add new models without changing the application logic
- Handle model-specific configurations and error cases
- Maintain consistent API responses regardless of the underlying model

### Prompt Management

The application includes a sophisticated prompt management system (`prompts.js`) that handles AI model prompts in a structured and maintainable way. Key features:

- **Template-based Prompts**: Each model has its own prompt template with placeholders for dynamic content
- **Model-Specific Configurations**: Different prompts and styles for each AI model
- **Parameter Validation**: Ensures all required parameters are provided before generating prompts
- **Error Handling**: Robust error checking for invalid prompt types or missing parameters

### Example Prompt Structure
```javascript
{
  template: 'Create a clear, educational illustration for the Italian word "{word}" (translation: "{translation}")',
  style: 'minimalist, clean, educational, professional illustration',
  negativePrompt: 'complex, cluttered, inappropriate, text, watermark'
}
```

## Data Handling

The application currently uses JSON files for data storage, with vocabulary data stored in `backend/data/vocabulary.json`. The data structure includes categories and words with their translations, examples, and other metadata.

### MongoDB Setup Status
While MongoDB is set up in the project (with models and connection code in `backend/models/`), it's not currently being used in the implementation. The MongoDB integration is prepared but needs further implementation to:
- Store user progress and statistics
- Save favorite words
- Track learning history
- Enable user-specific features

## Project Structure

```
flashcards-app/
├── frontend/           # React frontend application
│   ├── src/           # Source code
│   ├── public/        # Static assets
│   └── API.md         # API documentation
├── backend/           # Node.js backend server
│   ├── models/        # Model handlers and configurations
│   ├── data/          # Data files
│   └── server.js      # Main server file
└── docs/             # Project documentation
```

## Development Environment

### Prerequisites

- Node.js (v18 or higher)
- AWS Account (for Bedrock features)
- OpenAI API key
- Git

### Development Tools
- ESLint for code quality
- Vite for fast development and building
- Hot module replacement
- React Developer Tools (recommended)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd flashcards-app
```

2. Set up the backend:
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
```

3. Set up the frontend:
```bash
cd ../frontend
npm install
```

### Environment Variables

Create a `.env` file in the backend directory with the following variables:
```
# AWS credentials for Bedrock
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region

# OpenAI API key
OPENAI_API_KEY=your_openai_api_key
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`

### Development Ports
- Frontend development server: 5173
- Backend API server: 3000

### API Documentation
The API documentation is available through Swagger UI at:
```
http://localhost:3000/api-docs
```

This interactive documentation provides:
- Complete list of all available endpoints
- Request/response schemas
- Try-it-out functionality for testing endpoints
- Detailed parameter descriptions
- Authentication requirements

## License

This project is licensed under the ISC License - see the LICENSE file for details. 