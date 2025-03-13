import json
import os
import subprocess
from typing import Dict, List
import boto3
from tempfile import NamedTemporaryFile
import logging
from backend.config import AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_DEFAULT_REGION

class AudioGenerator:
    def __init__(self):
        """Initialize the audio generator with Polly client"""
        try:
            # Configure AWS session with credentials from config
            session = boto3.Session(
                aws_access_key_id=AWS_ACCESS_KEY_ID,
                aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
                region_name=AWS_DEFAULT_REGION
            )
            
            self.polly = session.client('polly')
            
            # Define Italian voice
            self.voice_id = 'Bianca'  # Standard Italian female voice
            
            # Create audio output directory
            self.audio_dir = os.path.join(os.path.dirname(__file__), 'data', 'audio')
            os.makedirs(self.audio_dir, exist_ok=True)
            
        except Exception as e:
            logging.error(f"Failed to initialize AWS clients: {str(e)}")
            raise

    def _generate_audio(self, text: str) -> str:
        """Generate audio using Amazon Polly"""
        try:
            response = self.polly.synthesize_speech(
                Text=text,
                OutputFormat='mp3',
                VoiceId=self.voice_id,
                LanguageCode='it-IT',
                Engine='standard'  # Use standard engine for better compatibility
            )
            
            # Save audio to temporary file
            with NamedTemporaryFile(suffix='.mp3', delete=False) as f:
                f.write(response['AudioStream'].read())
                return f.name
                
        except Exception as e:
            logging.error(f"Failed to generate audio with Polly: {str(e)}")
            raise

    def generate_question_audio(self, question: Dict) -> str:
        """Generate audio for a question"""
        try:
            # For all questions, use a simple format
            output_file = os.path.join(self.audio_dir, f"question_{question['id']}.mp3")
            
            # Generate direct audio for the question
            audio_file = self._generate_audio(question['question'])
            
            # Move the generated audio to the final location
            os.rename(audio_file, output_file)
            return output_file
            
        except Exception as e:
            logging.error(f"Failed to generate question audio: {str(e)}")
            raise 