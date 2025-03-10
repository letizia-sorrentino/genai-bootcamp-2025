# Listening Comprehension Application

This repository contains a listening comprehension application built with Streamlit and AWS Bedrock for AI-powered responses.

## Prerequisites
- Python 3.9+
- AWS account
- Required Python packages (see `requirements.txt`)

## Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Set up a virtual environment (recommended):
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## AWS Bedrock Setup

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

4. Configure AWS credentials:
   ```bash
   aws configure
   ```
   - Enter your Access Key ID and Secret Access Key
   - Set the default region to "us-east-1" (or the region you're using)
   - Set the output format (optional, press Enter for default)

## Running the Application

### Running the Backend

```bash
cd backend
python main.py
```

### Running the Frontend (Streamlit App)

```bash
streamlit run chat.py
```

This will start the Streamlit app and open it in your default web browser. If it doesn't open automatically, you can access it at http://localhost:8501.

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

### Streamlit Run Issues

If you see this warning:
```
Warning: to view this Streamlit app on a browser, run it with the following command: streamlit run chat.py [ARGUMENTS]
```

You're trying to run a Streamlit app with Python directly. Always use `streamlit run <filename>` instead of `python <filename>`.

## Project Structure

- `backend/` - Backend code and API
  - `main.py` - Backend entry point
  - `bedrock_chat.py` - AWS Bedrock integration

- `chat.py` - Streamlit frontend application

## Configuration

You can modify the following settings in `bedrock_chat.py`:

- `MODEL_ID` - The AWS Bedrock model ID to use
- `region_name` - AWS region (default: "us-east-1")

## Additional Information

For more information about:
- [AWS Bedrock documentation](https://docs.aws.amazon.com/bedrock/)
- [Streamlit documentation](https://docs.streamlit.io/)