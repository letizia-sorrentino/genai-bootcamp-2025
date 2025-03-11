import boto3
from typing import List, Dict, Optional
import json
import os
import re
from config import *  # Import AWS configuration

# Define base paths
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BACKEND_DIR, "data")
TRANSCRIPTS_DIR = os.path.join(DATA_DIR, "transcripts")
STRUCTURED_DATA_DIR = os.path.join(DATA_DIR, "structured_data")

class ListeningTestExtractor:
    def __init__(self):
        self.bedrock = boto3.client('bedrock-runtime')
        # Create output directory if it doesn't exist
        os.makedirs(STRUCTURED_DATA_DIR, exist_ok=True)
        
    def extract_structured_data(self, transcript: str) -> str:
        """
        Extract structured data from an Italian listening practice test transcript
        and format it as a structured text
        
        Args:
            transcript (str): The transcript text to analyze
            
        Returns:
            str: Formatted text with introduction and questions
        """
        # Clean the transcript to remove unnecessary markers
        cleaned_transcript = re.sub(r'\[Music\]', '', transcript)

        prompt = f"""
        Analyze this Italian listening practice test transcript and format it as a structured text.
        The transcript should be formatted exactly like this:

        INTRODUCTION
        -----------
        [Write the introduction text explaining the test format, including:
        - This is an Italian A1 level test
        - Number of questions (exactly 10)
        - Time limit per question (5 seconds)
        - That you can pause if needed]

        QUESTIONS
        ---------

        <question>
        Number: [question number]

        Question: [question in Italian]

        Options:
        1. [first distinct option in Italian]
        2. [second distinct option in Italian]
        3. [third distinct option in Italian]
         
        Correct answer: [the correct answer in Italian]
            
        Explanation: [clear explanation in English about the specific grammar rule being tested]
        </question>

        Important rules:
        1. Format each question exactly as shown above with all sections
        2. Create EXACTLY 10 questions, no more, no less
        3. Keep all Italian text in Italian
        4. Write explanations in clear English
        5. Number questions sequentially from 1 to 10
        6. Make sure each question has exactly 3 DIFFERENT options
        7. Include the specific grammar point being tested in each explanation
        8. Each question should focus on a single, clear grammar concept
        9. Do not create questions about the video itself (like "did you like the video?")
        10. Make sure the correct answer matches one of the three options exactly

        Here's the transcript to analyze and format:
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
            
            if 'output' in response_body and 'message' in response_body['output']:
                formatted_text = response_body['output']['message']['content'][0]['text']
                return formatted_text
            else:
                print("Unexpected response format")
                return None
            
        except Exception as e:
            print(f"Error extracting structured data: {str(e)}")
            return None

    def save_structured_text(self, text: str, filename: str) -> str:
        """
        Save structured text to a file
        
        Args:
            text (str): The structured text to save
            filename (str): Output filename without extension
            
        Returns:
            str: Full path to the saved file if successful, None otherwise
        """
        try:
            output_path = os.path.join(STRUCTURED_DATA_DIR, f"{filename}_structured.txt")
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(text)
            return output_path
        except Exception as e:
            print(f"Error saving structured text: {str(e)}")
            return None

def process_transcript(transcript_path: str, output_filename: str) -> Optional[str]:
    """
    Process a transcript file and save structured text
    
    Args:
        transcript_path (str): Path to the transcript text file
        output_filename (str): Name for the output file (without extension)
        
    Returns:
        Optional[str]: Path to the saved text file if successful, None otherwise
    """
    try:
        # Read transcript
        with open(transcript_path, 'r', encoding='utf-8') as f:
            transcript_text = f.read()
        
        # Extract and save structured text
        extractor = ListeningTestExtractor()
        structured_text = extractor.extract_structured_data(transcript_text)
        
        if structured_text:
            output_path = extractor.save_structured_text(structured_text, output_filename)
            if output_path:
                print(f"Structured text saved successfully to {output_path}")
                return output_path
            else:
                print("Failed to save structured text")
                return None
        else:
            print("Failed to extract structured text")
            return None
            
    except Exception as e:
        print(f"Error processing transcript: {str(e)}")
        return None

if __name__ == "__main__":
    # Create necessary directories
    os.makedirs(TRANSCRIPTS_DIR, exist_ok=True)
    os.makedirs(STRUCTURED_DATA_DIR, exist_ok=True)
    
    # Check if transcripts directory exists
    if not os.path.exists(TRANSCRIPTS_DIR):
        print(f"Error: Directory {TRANSCRIPTS_DIR} does not exist")
        exit(1)
    
    # Get all txt files in the directory
    transcript_files = [f for f in os.listdir(TRANSCRIPTS_DIR) if f.endswith('.txt')]
    
    if not transcript_files:
        print(f"No transcript files found in {TRANSCRIPTS_DIR}")
        exit(1)
        
    print(f"Found {len(transcript_files)} transcript file(s)")
    
    # Process each transcript file
    for transcript_file in transcript_files:
        print(f"\nProcessing {transcript_file}...")
        transcript_path = os.path.join(TRANSCRIPTS_DIR, transcript_file)
        output_filename = os.path.splitext(transcript_file)[0]  # Remove .txt extension
        
        output_path = process_transcript(transcript_path, output_filename)
        
        if output_path:
            print(f"Successfully processed {transcript_file}. Output saved to: {output_path}")
        else:
            print(f"Failed to process {transcript_file}")
