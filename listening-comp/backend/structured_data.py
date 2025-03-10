import boto3
from typing import List, Dict, Optional
import json
import os
import re
from config import *  # Import AWS configuration

class ListeningTestExtractor:
    def __init__(self):
        self.bedrock = boto3.client('bedrock-runtime')
        
    def extract_structured_data(self, transcript: str) -> Dict:
        """
        Extract structured data from an Italian listening practice test transcript
        
        Args:
            transcript (str): The transcript text to analyze
            
        Returns:
            Dict: Structured data containing introduction, questions with answers and explanations
        """
         # Clean the transcript to remove unnecessary markers
        cleaned_transcript = re.sub(r'\[Music\]', '', transcript)

        prompt = f"""
        Analyze this Italian listening practice test transcript and extract the structured information.
        The transcript follows this pattern:
        1. An introduction explaining the test format
        2. Multiple questions, each with:
           - A question or scenario
           - A correct answer (marked with "the correct answer is...")
           - A grammatical explanation after the answer

        Extract and format the information as a JSON object with this structure:
        {{
            "introduction": "The initial instructions about the test format, time limits, and rules",
            "questions": [
                {{
                    "number": 1,
                    "question": "The actual question or scenario being asked",
                    "correct_answer": "The answer marked as correct",
                    "explanation": "The grammatical explanation provided after the answer"
                }}
            ]
        }}

        Important rules for extraction:
        1. The introduction should include all instructions before the first question
        2. Each question should be numbered sequentially
        3. The correct answer is always marked with "the correct answer is..."
        4. The explanation usually follows immediately after the answer
        5. Ignore any "[Music]" markers
        6. If a question has multiple parts, combine them into a single question
        7. Keep the original Italian text in the explanations

        Example of how to identify parts:
        - Question: "with you have five seconds"
        - Correct answer: "belle ed interessante"
        - Explanation: "the noun done is a feminine plural so the adjective will be belle adjectivo qualificativo primo gruppo and interesante adjectivo qualificativo secondo gruppo"

        Transcript:
        {cleaned_transcript}
        """

        try:
            response = self.bedrock.invoke_model(
                modelId='amazon.nova-lite-v1:0',
                body=json.dumps({
                    "messages": [
                        {
                            "role": "user",
                            "content": [{"text": prompt}]
                        }
                    ]
                })
            )
            
            response_body = json.loads(response['body'].read())
            
            # Extract the completion text from the correct path in the response
            if 'output' in response_body and 'message' in response_body['output']:
                content = response_body['output']['message']['content'][0]['text']
                # Remove the ```json and ``` markers if present
                content = content.replace('```json\n', '').replace('\n```', '')
                structured_data = json.loads(content)
            else:
                print("Unexpected response format")
                structured_data = {
                    "introduction": "",
                    "questions": []
                }
            
            return structured_data
            
        except Exception as e:
            print(f"Error extracting structured data: {str(e)}")
            return {
                "introduction": "",
                "questions": [],
                "answers": []
            }

    def save_structured_data(self, data: Dict, filename: str) -> bool:
        """
        Save structured data to a JSON file
        
        Args:
            data (Dict): The structured data to save
            filename (str): Output filename
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            with open(f"./structured_data/{filename}.json", 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            print(f"Error saving structured data: {str(e)}")
            return False

def read_transcript(file_path: str) -> str:
    """
    Read transcript from a text file
    
    Args:
        file_path (str): Path to the transcript text file
        
    Returns:
        str: The transcript text
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"Error reading transcript file: {str(e)}")
        return ""

def process_transcript(transcript_text: str, output_filename: str) -> Optional[Dict]:
    """
    Process a transcript and extract structured data
    
    Args:
        transcript_text (str): The transcript text to process
        output_filename (str): Name for the output file
        
    Returns:
        Optional[Dict]: The structured data if successful, None otherwise
    """
    extractor = ListeningTestExtractor()
    
    # Extract structured data
    structured_data = extractor.extract_structured_data(transcript_text)
    
    if structured_data:
        # Save the structured data
        if extractor.save_structured_data(structured_data, output_filename):
            print(f"Structured data saved successfully to {output_filename}.json")
            return structured_data
        else:
            print("Failed to save structured data")
            return None
    else:
        print("Failed to extract structured data")
        return None

if __name__ == "__main__":
    # Read transcript from file
    transcript_path = "./transcripts/listening_test_1.txt" 
    transcript_text = read_transcript(transcript_path)
    
    if transcript_text:
        result = process_transcript(transcript_text, "listening_test_1")
    else:
        print("Failed to read transcript file")
