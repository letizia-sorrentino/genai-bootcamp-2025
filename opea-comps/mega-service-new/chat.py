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
LLM_SERVICE_HOST_IP = os.getenv("LLM_SERVICE_HOST_IP", "0.0.0.0")
LLM_SERVICE_PORT = os.getenv("LLM_SERVICE_PORT", 9002)
GRADING_SERVICE_HOST_IP = os.getenv("GRADING_SERVICE_HOST_IP", "0.0.0.0")
GRADING_SERVICE_PORT = os.getenv("GRADING_SERVICE_PORT", 9003)

class Chat:
    def __init__(self, host="0.0.0.0", port=8000):
        # Disable telemetry
        os.environ["TELEMETRY_ENDPOINT"] = ""
        self.host = host
        self.port = port
        self.endpoint = "/v1/chat"
        self.megaservice = ServiceOrchestrator()
        
    def add_remote_services(self):
        # Add LLM service
        llm = MicroService(
            name="llm",
            host=LLM_SERVICE_HOST_IP,
            port=LLM_SERVICE_PORT,
            endpoint="/v1/chat/completions",
            use_remote_service=True,
            service_type=ServiceType.LLM,
        )
        
        # Add Grading service
        grading = MicroService(
            name="grading",
            host=GRADING_SERVICE_HOST_IP,
            port=GRADING_SERVICE_PORT,
            endpoint="/v1/grade",
            use_remote_service=True,
            service_type=ServiceType.LLM,
        )
        
        # Add services to orchestrator and set up flow
        self.megaservice.add(llm).add(grading)
        self.megaservice.flow_to(llm, grading)
    
    def start(self):
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
        try:
            # Format the request for LLM service
            llm_request = {
                "model": request.model or "llama3.2:1b",
                "messages": request.messages,
                "stream": False
            }
            
            # Schedule the request through the orchestrator
            result = await self.megaservice.schedule(llm_request)
            
            # Process the response
            if isinstance(result, tuple) and len(result) > 0:
                # Get responses from both services
                llm_response = result[0].get('llm/MicroService')
                grading_response = result[0].get('grading/MicroService')
                
                # Process LLM response
                if hasattr(llm_response, 'body'):
                    response_body = b""
                    async for chunk in llm_response.body_iterator:
                        response_body += chunk
                    content = response_body.decode('utf-8')
                else:
                    content = "No response content available"
                
                # Process grading response
                if hasattr(grading_response, 'body'):
                    grade_body = b""
                    async for chunk in grading_response.body_iterator:
                        grade_body += chunk
                    grade_content = grade_body.decode('utf-8')
                else:
                    grade_content = "No grade available"
                
                # Combine responses
                final_content = f"{content}\nGrade: {grade_content}"
            else:
                final_content = "Invalid response format"

            # Create the response
            response = ChatCompletionResponse(
                model=request.model or "example-model",
                choices=[
                    ChatCompletionResponseChoice(
                        index=0,
                        message=ChatMessage(
                            role="assistant",
                            content=final_content
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
            raise HTTPException(status_code=500, detail=str(e))

if __name__ == '__main__':
    chat = Chat()
    chat.add_remote_services()
    chat.start()