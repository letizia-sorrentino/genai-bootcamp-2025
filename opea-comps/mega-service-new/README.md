# Mega Service with Two LLM Services

This project demonstrates how to create a mega-service that orchestrates two LLM services using the OPEA (Open Platform for Enterprise AI) components.

## Technical Notes

### OPEA and LLM Server
OPEA itself does not serve the LLM model directly. Instead, it provides:
1. A framework for orchestrating services
2. Components for service communication
3. Protocol definitions for API requests/responses

In our implementation:
- We use Ollama as the actual LLM server (running in Docker containers)
- OPEA components handle the communication and orchestration
- The LLM service is external to OPEA, but OPEA manages the interaction with it

### Service Architecture
```
[OPEA Components]
    │
    ├── ServiceOrchestrator (manages service flow)
    │
    ├── MicroService (handles individual service communication)
    │
    └── API Protocol (defines request/response formats)
    │
[External Services]
    │
    ├── Ollama LLM Server (port 9000)
    │
    └── Ollama Grading Server (port 9001)
```

### Service Orchestration
The orchestration of two services is handled through OPEA's ServiceOrchestrator in three key steps:

1. **Service Registration**:
   ```python
   # In chat.py
   def add_remote_services(self):
       # Register LLM service
       llm = MicroService(
           name="llm",
           host=LLM_SERVICE_HOST_IP,
           port=LLM_SERVICE_PORT,
           endpoint="/v1/chat/completions",
           use_remote_service=True,
           service_type=ServiceType.LLM,
       )
       
       # Register Grading service
       grading = MicroService(
           name="grading",
           host=GRADING_SERVICE_HOST_IP,
           port=GRADING_SERVICE_PORT,
           endpoint="/v1/grade",
           use_remote_service=True,
           service_type=ServiceType.LLM,
       )
   ```

2. **Flow Definition**:
   ```python
   # Define the flow between services
   self.megaservice.add(llm).add(grading)
   self.megaservice.flow_to(llm, grading)
   ```
   This creates a pipeline where:
   - Output from LLM service becomes input to Grading service
   - Services are executed in sequence

3. **Request Processing**:
   ```python
   # Schedule request through orchestrator
   result = await self.megaservice.schedule(llm_request)
   
   # Process responses from both services
   llm_response = result[0].get('llm/MicroService')
   grading_response = result[0].get('grading/MicroService')
   ```

### Orchestration Flow
```
[User Request]
       ↓
[ServiceOrchestrator]
       ↓
[LLM Service] → [Grading Service]
       ↓              ↓
[Response 1] → [Response 2]
       ↓              ↓
[Combined Response]
```

Key Points:
- Services are registered with unique names
- Flow is defined using `flow_to()`
- Orchestrator manages request/response flow
- Responses are collected and combined
- Error handling is managed at each step

## Project Structure

```
mega-service-new/
├── chat.py              # Main service implementation
├── docker-compose.yaml  # Docker configuration
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

## Setup Process

### 1. Dependencies Setup
- Created `requirements.txt` with:
  ```
  opea-comps
  fastapi
  ```

### 2. Service Implementation
- Created `chat.py` with the following components:
  - Environment variables for service configuration
  - Chat class with service orchestration
  - Request/response handling
  - Service flow setup

### 3. Docker Configuration
- Created `docker-compose.yaml` with:
  - Two Ollama services:
    - LLM server (port 9000)
    - Grading server (port 9001)
  - Network configuration
  - Environment variables setup

## How It Works

1. **Service Initialization**
   ```python
   chat = Chat()
   chat.add_remote_services()
   chat.start()
   ```

2. **Service Flow**
   ```
   User Request → Mega Service → LLM Service → Grading Service → Combined Response
   ```

3. **Detailed Flow Explanation**:
   a. **Initial Request**:
      - User sends a POST request to `/v1/chat` endpoint
      - Request contains the message to be processed
      - Request format follows ChatCompletionRequest protocol

   b. **Mega Service Processing**:
      - Mega service receives the request
      - Formats the request for the LLM service
      - Uses ServiceOrchestrator to manage the flow

   c. **LLM Service**:
      - Receives formatted request on port 9000
      - Processes the request using Ollama
      - Returns generated response
      - Response is passed to grading service

   d. **Grading Service**:
      - Receives LLM response on port 9001
      - Evaluates the response
      - Returns grading result
      - Result is combined with LLM response

   e. **Final Response**:
      - Mega service combines both responses
      - Returns formatted result to user
      - Includes both content and grade

4. **Request Processing Example**:
   ```python
   # User sends request
   POST /v1/chat
   {
       "model": "llama3.2:1b",
       "messages": "Translate to Italian: Hello, how are you?"
   }

   # LLM Service Response
   "Ciao, come stai?"

   # Grading Service Response
   "Grade: A - Correct translation with proper grammar"

   # Final Combined Response
   {
       "model": "example-model",
       "choices": [{
           "message": {
               "content": "Ciao, come stai?\nGrade: A - Correct translation with proper grammar"
           }
       }]
   }
   ```

## Running the Service

1. Start the Docker containers:
   ```bash
   docker-compose up -d
   ```

2. Run the mega-service:
   ```bash
   python chat.py
   ```

3. Send requests to:
   ```
   POST http://localhost:8000/v1/chat
   ```

## Environment Variables

- `LLM_SERVICE_HOST_IP`: LLM service host (default: 0.0.0.0)
- `LLM_SERVICE_PORT`: LLM service port (default: 9000)
- `GRADING_SERVICE_HOST_IP`: Grading service host (default: 0.0.0.0)
- `GRADING_SERVICE_PORT`: Grading service port (default: 9001)
- `LLM_MODEL_ID`: Model ID for Ollama services
- `host_ip`: Host IP for services

## Response Format

The service returns a combined response in the following format:
```json
{
    "model": "example-model",
    "choices": [
        {
            "index": 0,
            "message": {
                "role": "assistant",
                "content": "LLM Response\nGrade: Grading Response"
            },
            "finish_reason": "stop"
        }
    ],
    "usage": {
        "prompt_tokens": 0,
        "completion_tokens": 0,
        "total_tokens": 0
    }
}
```

## Error Handling

- All exceptions are caught and returned as HTTP 500 errors
- Invalid responses are handled gracefully
- Missing service responses are handled with default messages 

## Troubleshooting

### Common Issues
1. Service Connection Issues
   - Check if Docker containers are running
   - Verify port configurations
   - Check network connectivity

2. Response Errors
   - Verify request format
   - Check model availability
   - Review error logs 