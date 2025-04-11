# Listening Comprehension Application

This repository contains a listening comprehension application built with Streamlit and AWS Bedrock for AI-powered responses.

## Prerequisites
- Docker and Docker Compose
- AWS account with Bedrock access
- AWS credentials (Access Key ID and Secret Access Key)

## Key Features

### 🤖 Chat with Nova
Interact with Nova, our AI-powered Italian language assistant. Ask questions about Italian grammar, vocabulary, or cultural aspects and get instant responses.

![Chat Interface](screenshots/Screenshot%202025-04-11%20at%2021.33.00.png)

Features:
- Real-time conversation with AI
- Example questions provided
- Clear chat history
- Easy-to-use interface

### 📚 Practice Questions
Practice your Italian with interactive questions that include audio playback for listening comprehension.

![Question Interface](screenshots/Screenshot%202025-04-11%20at%2021.52.39.png)
![Sample Answer 1](screenshots/Screenshot%202025-04-11%20at%2021.53.24.png)
![Sample Answer 2](screenshots/Screenshot%202025-04-11%20at%2021.46.19.png)

Features:
- Multiple choice questions
- Audio playback for listening practice
- Immediate feedback on answers
- Detailed explanations
- Progress tracking

### 🎧 Audio Generation
Listen to AI-generated Italian audio for perfect pronunciation practice.

![Audio Controls](screenshots/Screenshot%202025-04-11%20at%2021.52.54.png)

## Installation and Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Configure AWS Credentials
Create a `.env` file in the root directory with your AWS credentials:
```bash
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_DEFAULT_REGION=us-east-1
```

### 3. AWS Bedrock Setup
1. Create an AWS account if you don't have one
2. Create an IAM user with programmatic access:
   - Sign in to AWS Management Console
   - Navigate to IAM service
   - Create a new user with "Programmatic access"
   - Attach the "AmazonBedrockFullAccess" policy
   - Save the Access Key ID and Secret Access Key

3. Enable Bedrock model access:
   - Navigate to Amazon Bedrock in AWS Console
   - Go to "Model access" in the left sidebar
   - Request access to the required models (e.g., amazon.nova-micro-v1:0)
   - Accept the terms of service

### 4. Run the Application
1. Build and start the containers:
   ```bash
   docker-compose up --build
   ```

2. Access the application:
   - Frontend: http://localhost:8501
   - Backend API: http://localhost:8000

3. To stop the containers:
   ```bash
   docker-compose down
   ```

## Troubleshooting

### AWS Access Issues

If you encounter this error:
```
Error generating response: An error occurred (AccessDeniedException) when calling the Converse operation: You don't have access to the model with the specified model ID.
```

Ensure that:
1. You've requested access to the model in the AWS Bedrock console
2. Your IAM user has the necessary permissions
3. The model ID in your code matches an available model in your account

### Docker Issues

If you encounter AWS credential issues in Docker:
1. Verify your `.env` file contains the correct AWS credentials
2. Check that the environment variables are properly set in the containers:
   ```bash
   docker-compose exec backend env | grep AWS
   ```
3. Ensure the AWS credentials have the necessary permissions

## Project Structure

- `backend/` - Backend code and API
  - `main.py` - Backend entry point
  - `bedrock_chat.py` - AWS Bedrock integration

- `frontend/` - Streamlit frontend application
  - `main.py` - Frontend entry point

## Configuration

You can modify the following settings in `backend/bedrock_chat.py`:

- `MODEL_ID` - The AWS Bedrock model ID to use
- `region_name` - AWS region (default: "us-east-1")

## Additional Information

For more information about:
- [AWS Bedrock documentation](https://docs.aws.amazon.com/bedrock/)
- [Streamlit documentation](https://docs.streamlit.io/)
- [Docker documentation](https://docs.docker.com/)