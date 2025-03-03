from fastapi import HTTPException
from comps.cores.proto.api_protocol import (
    ChatCompletionRequest,
    ChatCompletionResponse,
    ChatCompletionResponseChoice,
    ChatMessage,
    UsageInfo
)
from comps.cores.mega.constants import ServiceType, ServiceRoleType
from comps import MicroService, ServiceOrchestrator
import os

# Environment variables for service configuration
# Embedding service connection details (not currently used in this implementation)
EMBEDDING_SERVICE_HOST_IP = os.getenv("EMBEDDING_SERVICE_HOST_IP", "0.0.0.0")
EMBEDDING_SERVICE_PORT = os.getenv("EMBEDDING_SERVICE_PORT", 6000)
# LLM service connection details - connects to the Ollama service
LLM_SERVICE_HOST_IP = os.getenv("LLM_SERVICE_HOST_IP", "0.0.0.0")
LLM_SERVICE_PORT = os.getenv("LLM_SERVICE_PORT", 9000)


class ExampleService:
    """
    Example Mega-Service that orchestrates connections to remote LLM services.
    This class creates a FastAPI endpoint that forwards requests to an Ollama LLM service
    and returns the responses in a standard format.
    """
    def __init__(self, host="0.0.0.0", port=8000):
        print('hello')
        # Disable telemetry
        os.environ["TELEMETRY_ENDPOINT"] = ""
        self.host = host
        self.port = port
        # Endpoint that will be exposed for API requests
        self.endpoint = "/v1/example-service"
        # Initialize the service orchestrator for managing multiple services
        self.megaservice = ServiceOrchestrator()

    def add_remote_service(self):
        """
        Configure and add remote services to the orchestrator.
        Currently only adds the LLM service (Ollama).
        Note: Embedding service is commented out but shows how it could be added.
        """
        #embedding = MicroService(
        #    name="embedding",
        #    host=EMBEDDING_SERVICE_HOST_IP,
        #    port=EMBEDDING_SERVICE_PORT,
        #    endpoint="/v1/embeddings",
        #    use_remote_service=True,
        #    service_type=ServiceType.EMBEDDING,
        #)
        llm = MicroService(
            name="llm",
            host=LLM_SERVICE_HOST_IP,
            port=LLM_SERVICE_PORT,
            endpoint="/v1/chat/completions",
            use_remote_service=True,
            service_type=ServiceType.LLM,
        )
        #self.megaservice.add(embedding).add(llm)
        #self.megaservice.flow_to(embedding, llm)
        self.megaservice.add(llm)
    
    def start(self):
        """
        Initialize and start the FastAPI service.
        Creates a MicroService with the specified endpoint and request handler.
        """
        self.service = MicroService(
            self.__class__.__name__,
            service_role=ServiceRoleType.MEGASERVICE,
            host=self.host,
            port=self.port,
            endpoint=self.endpoint,
            input_datatype=ChatCompletionRequest,
            output_datatype=ChatCompletionResponse,
        )

        self.service.add_route(self.endpoint, self.handle_request, methods=["POST"])

        self.service.start()

    async def handle_request(self, request: ChatCompletionRequest) -> ChatCompletionResponse:
        """
        Handle incoming API requests by forwarding them to the LLM service.
        
        Args:
            request: A ChatCompletionRequest containing model and message data
            
        Returns:
            ChatCompletionResponse: Formatted response from the LLM
            
        Raises:
            HTTPException: If an error occurs during processing
        """
        try:
            # Format the request for Ollama
            ollama_request = {
                "model": request.model or "llama3.2:1b",  # or whatever default model you're using
                "messages": [
                    {
                        "role": "user",
                        "content": request.messages  # assuming messages is a string
                    }
                ],
                "stream": False  # disable streaming for now
            }
            
            # Schedule the request through the orchestrator
            result = await self.megaservice.schedule(ollama_request)
            
            # Extract the actual content from the response
            if isinstance(result, tuple) and len(result) > 0:
                llm_response = result[0].get('llm/MicroService')
                if hasattr(llm_response, 'body'):
                    # Read and process the response
                    response_body = b""
                    async for chunk in llm_response.body_iterator:
                        response_body += chunk
                    content = response_body.decode('utf-8')
                else:
                    content = "No response content available"
            else:
                content = "Invalid response format"

            # Create the response
            response = ChatCompletionResponse(
                model=request.model or "example-model",
                choices=[
                    ChatCompletionResponseChoice(
                        index=0,
                        message=ChatMessage(
                            role="assistant",
                            content=content
                        ),
                        finish_reason="stop"
                    )
                ],
                usage=UsageInfo(
                    prompt_tokens=0,
                    completion_tokens=0,
                    total_tokens=0
                )
            )
            
            return response
            
        except Exception as e:
            # Handle any errors
            raise HTTPException(status_code=500, detail=str(e))

# Initialize and start the example service
example = ExampleService()
example.add_remote_service()
example.start()