# Setting Up the Mega Service

This guide provides step-by-step instructions for setting up and running the mega service. For detailed information about the service architecture and components, please refer to the README.md file.

## Prerequisites

- Docker Desktop installed and running
- Python 3.8 or higher
- Terminal access

## Step 1: Set Up Environment Variables

Open a terminal and set the required environment variables:

```bash
# Set the model ID
export LLM_MODEL_ID=llama3.2:1b

# Set the host IP (for macOS)
export host_ip=$(ipconfig getifaddr en0)

# Set no_proxy to avoid proxy issues
export no_proxy=localhost,127.0.0.1
```

## Step 2: Start Docker Containers

In the same terminal, navigate to the mega-service directory and start the Docker containers:

```bash
cd /Users/letizia/vs_code/genai-bootcamp-2025/opea-comps/mega-service-new
docker-compose up -d
```

This will start two containers:
- LLM server on port 9002
- Grading server on port 9003

## Step 3: Pull Required Models

In the same terminal, pull the required model for both services:

```bash
# Pull model for LLM server
curl -X POST http://localhost:9002/api/pull -d '{"model": "llama3.2:1b"}'

# Pull model for Grading server
curl -X POST http://localhost:9003/api/pull -d '{"model": "llama3.2:1b"}'
```

## Step 4: Start the Mega Service

Open a new terminal window and start the mega service:

```bash
cd /Users/letizia/vs_code/genai-bootcamp-2025/opea-comps/mega-service-new
python chat.py
```

The service will start on `http://localhost:8000`.

## Step 5: Test the Service

Open a third terminal window to test the service:

```bash
curl -X POST http://localhost:8000/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.2:1b",
    "messages": [
      {
        "role": "user",
        "content": "Hello, how are you?"
      }
    ]
  }'
```

## Troubleshooting

1. If Docker containers fail to start:
   - Ensure Docker Desktop is running
   - Check if ports 9002 and 9003 are available
   - Run `docker ps` to verify container status

2. If models fail to pull:
   - Check internet connection
   - Verify Docker container logs with `docker logs llm-server` or `docker logs grading-server`

3. If mega service fails to start:
   - Ensure all environment variables are set correctly
   - Check if Python dependencies are installed (`pip install -r requirements.txt`)
   - Verify ports 8000, 9002, and 9003 are available

For more detailed error information and known issues, please refer to ERROR_LOG.md. 