## OPEA GenAI Comps
'OPEA GenAI Comps' refers to the Generative AI Components (GenAIComps) developed under the Open Platform for Enterprise AI (OPEA) initiative. This open-source project provides a suite of microservices designed to facilitate the development of enterprise-grade Generative AI applications. By leveraging a service composer, these microservices can be assembled into comprehensive ‘mega-services’ tailored for real-world enterprise AI applications. Each microservice is containerised, supporting cloud-native deployment, which simplifies scaling and integration within existing infrastructures.

## Ollama
Ollama is a lightweight framework for running open-source large language models (like Llama 3) locally on your machine. It packages model weights, configuration, and data into a single bundle called a Modelfile. Ollama offers a simple API for creating, running, and managing models, along with a library of pre-built models ready for various applications. It's considered the optimal solution for deploying large language models locally on AIPC.

## Running Ollama Third-Party Service
To run the Ollama third-party service, you need to have the following installed:
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/en/download/)
- [npm](https://www.npmjs.com/get-npm)

### Steps to run the service
When using this docker-compose file, you need to set several environment variables either in your shell or in a .env file in the same directory as your docker-compose.yml file. Here are the variables you should set:

- LLM_ENDPOINT_PORT (optional) - The port on your host machine that will be mapped to port 11434 in the container. Defaults to 8008 if not specified.
- no_proxy (optional) - Comma-separated list of hosts that should bypass the proxy.
- http_proxy (optional) - URL of the HTTP proxy server to use.
- https_proxy (optional) - URL of the HTTPS proxy server to use.
- LLM_MODEL_ID (required) - The ID of the Ollama model you want to use (e.g., "llama2", "llama3", etc.).
host_ip (required) - The IP address of your host machine for network configuration.

### Choosing the model
The LLM_MODEL_ID environment variable specifies the model you want to use. You can get the model_ID from the [Ollama Library](https://ollama.com/library). For exampple, if you want to use the "llama3.21B" model, you will find the info [here](https://ollama.com/library/llama3.2):

LLM_MODEL_ID="llama3.21B"

### Getting the host IP
To get the host IP, you can try: 
```bash
sudo apt install net-tools
ifconfig
```
or you can run wither this command:
```bash
$(hostname -I | awk '{print $1}')
```
or the following command:
```bash
host_ip=$(ifconfig | awk '/inet / && !/127.0.0.1/ {print $2; exit}')
```
and then run:
```bash
NO_PROXY=localhost LLM_ENDPOINT_PORT=9000 LLM_MODEL_ID="llama3.2:1b" docker compose up
```

### Ollama API
The Ollama API is a RESTful API that allows you to interact with the Ollama service. 
Once the Ollama server is running, we can make API calls to the [Ollama API](https://github.com/ollama/ollama/blob/main/docs/api.md).

### Checking the port 
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

Then, you can make a request using the following command:

```bash
curl http://localhost:9000/api/generate -d '{
  "model": "llama3.2:1b",
  "prompt": "Why is the sky blue?"
}'
```

### Run the Mega-Service example 
```bash
python app.py
```

## Making a request to the Mega-Service
```bash
curl -X POST http://localhost:8000/v1/example-service \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.2:1b",
    "messages": "Hello, how are you?"
  }' \
  -o response.json
```

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

