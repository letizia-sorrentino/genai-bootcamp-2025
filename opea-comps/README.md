## OPEA GenAI Comps
OPEA GenAI Comps is a collection of ready-to-use AI tools developed as part of the Open Platform for Enterprise AI (OPEA) project. These tools are built as small, independent services (microservices) that can be combined to create more advanced AI systems, called megaservices. This open-source project makes it easier for businesses to build and run AI applications. Each microservice runs in its own container, allowing it to be easily deployed in the cloud, making scaling and integration smoother.

## Ollama
Ollama is a simple tool for running large language models (like Llama 3) directly on your computer. It bundles everything needed—model files, settings, and data—into a single package called a Modelfile. Ollama provides an easy-to-use API to create, run, and manage models, along with a collection of ready-to-use models. It’s a great choice for running AI models locally on an AI-powered PC.

## Running Ollama Third-Party Service
### Prerequisites
To run the Ollama third-party service, you need to be using Docker. Ensure that Docker and Docker Compose are installed on your system.

### Configuration
When using this docker-compose file, you need to set several environment variables either in your shell or in a .env file in the same directory as your docker-compose.yml file. Here are the variables you should set:

#### Required Variables:
- LLM_ENDPOINT_PORT (optional) - The port on your host machine that will be mapped to port 11434 in the container. Defaults to 8008 if not specified.
- host_ip (required) - The IP address of your host machine for network configuration.

#### Optional Variables:
- no_proxy (optional) - Comma-separated list of hosts that should bypass the proxy.
- http_proxy (optional) - URL of the HTTP proxy server to use.
- https_proxy (optional) - URL of the HTTPS proxy server to use.
- LLM_MODEL_ID (required) - The ID of the Ollama model you want to use (e.g., "llama2", "llama3", etc.).

## Steps to Run the Service
1. Define the necessary environment variables as mentioned above.

2. Use the following command to bring up the service:
```bash
NO_PROXY=localhost LLM_ENDPOINT_PORT=9000 LLM_MODEL_ID="llama3.2:1b" docker compose up
```

### Choosing the model
The LLM_MODEL_ID environment variable specifies the model you want to use. You can get the model_ID from the [Ollama Library](https://ollama.com/library). For example, if you want to use the "llama3.21B" model, you will find the info [here](https://ollama.com/library/llama3.2):

```bash
LLM_MODEL_ID="llama3.21B"
```

### Getting the host IP
Use one of the following methods to get the host IP:
```bash
sudo apt install net-tools
ifconfig
```
OR
```bash
$(hostname -I | awk '{print $1}')
```
OR
```bash
host_ip=$(ifconfig | awk '/inet / && !/127.0.0.1/ {print $2; exit}')
```

## Ollama API
The Ollama API is a RESTful API that allows you to interact with the Ollama service. 
Once the Ollama server is running, we can make API calls to the [Ollama API](https://github.com/ollama/ollama/blob/main/docs/api.md).

### Checking the Running Port
To check on which port ollama is running, using the following command:
```bash
docker ps
```

### Download (Pull) a model
```bash 
curl http://localhost:9000/api/pull -d '{
  "model": "llama3.2:1b"
}'
```

### Generate text
Then, you can make a request using the following command:

```bash
curl http://localhost:9000/api/generate -d '{
  "model": "llama3.2:1b",
  "prompt": "Why is the sky blue?"
}'
```
### Stopping the Ollama Service
If you’re running Ollama as a service (Docker or systemd), you can stop it:
-	If running via Docker:
```bash
docker stop ollama
```

## Using the Ollama Service in a Mega-Service
In the context of OPEA GenAI Comps, a megaservice is a higher-level service that integrates multiple microservices (e.g., model serving, data processing, user management) into a unified system. It simplifies interaction by providing a single API endpoint, orchestrating microservices to deliver enterprise-grade Generative AI capabilities.

### Running the Mega-Service Example
```bash
python app.py
```

## Making a request to the Mega-Service
```bash
curl -X POST http://localhost:9000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.2:1b",
    "messages": [
      {"role": "user", "content": "Tell me a joke"}
    ]
  }' -o response.json
```
### Other Example Request
```bash
  curl -X POST http://localhost:8000/v1/example-service \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Hello world!"
      }
    ],
    "model": "test-model",
    "max_tokens": 100,
    "temperature": 0.7
  }'
```

