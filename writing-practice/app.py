import os
import random
import requests
import json
import streamlit as st
import pytesseract
from PIL import Image
import io
from openai import OpenAI
from io import BytesIO
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configuration
API_URL = "http://localhost:3000/api/groups"
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

# Default words to use when API is not available
DEFAULT_WORDS = [
    {"italian": "ciao", "english": "hello"},
    {"italian": "grazie", "english": "thank you"},
    {"italian": "sì", "english": "yes"},
    {"italian": "no", "english": "no"},
    {"italian": "per favore", "english": "please"},
    {"italian": "prego", "english": "you are welcome"},
    {"italian": "scusa", "english": "excuse me"},
    {"italian": "buongiorno", "english": "good morning"},
    {"italian": "buonasera", "english": "good evening"},
    {"italian": "arrivederci", "english": "goodbye"},
    {"italian": "come stai", "english": "how are you"},
    {"italian": "bene", "english": "well"},
    {"italian": "male", "english": "bad"},
    {"italian": "aiuto", "english": "help"},
    {"italian": "per piacere", "english": "please"}
]

# Initialize OpenAI client
if OPENAI_API_KEY:
    client = OpenAI(api_key=OPENAI_API_KEY)
else:
    st.error("OPENAI_API_KEY not found in environment variables. Please set it before running the application.")
    st.stop()

# Initialize session state
if 'italian_english_words' not in st.session_state:
    st.session_state.italian_english_words = []
if 'current_sentence' not in st.session_state:
    st.session_state.current_sentence = {}
if 'app_state' not in st.session_state:
    st.session_state.app_state = "setup"
if 'grade_results' not in st.session_state:
    st.session_state.grade_results = None
if 'uploaded_image' not in st.session_state:
    st.session_state.uploaded_image = None

# Functions
def fetch_words(group_id):
    """Fetch Italian words with English translations from API"""
    try:
        st.write(f"Fetching words from: {API_URL}/{group_id}/words")  # Debug log
        response = requests.get(f"{API_URL}/{group_id}/words")
        response.raise_for_status()
        data = response.json()
        
        # Extract words from the items array in the response
        if isinstance(data, dict) and 'items' in data:
            words = data['items']
        else:
            words = []
            
        st.write(f"Raw API response: {data}")  # Debug log
        st.write(f"Received {len(words) if words else 0} words")  # Debug log
        
        if not words:
            st.warning("No words received from API, using default word set")
            return DEFAULT_WORDS
            
        # Format words according to database schema
        formatted_words = []
        for word in words:
            if isinstance(word, dict):
                # Extract required fields, with fallbacks
                italian = word.get('italian', '')
                english = word.get('english', '')
                
                if italian and english:  # Only add if we have both translations
                    formatted_words.append({
                        'italian': italian,
                        'english': english
                    })
        
        if not formatted_words:
            st.warning("Received words in unexpected format, using default word set")
            return DEFAULT_WORDS
            
        st.write(f"Formatted words: {formatted_words}")  # Debug log
        return formatted_words
    except requests.exceptions.RequestException as e:
        st.warning(f"Error fetching words from API: {e}. Using default word set.")
        return DEFAULT_WORDS
    except Exception as e:
        st.warning(f"Unexpected error processing words: {e}. Using default word set.")
        return DEFAULT_WORDS

def generate_sentence(word):
    """Generate an Italian sentence using the provided word"""
    prompt = f"""
    Generate a simple Italian sentence using the word: {word['italian']}.

    - The sentence should follow A1-level Italian grammar, using:
      - Basic subject-verb-object structures (e.g., "Io mangio la pizza.")
      - Common present-tense verbs (e.g., "mangiare," "bere," "andare")
      - Basic adjectives and adverbs for more natural sentences (e.g., "buono," "velocemente")
      - Simple negation (e.g., "Non ho un cane.")
    - The sentence should be between 4-8 words long for simplicity.
    - Do not use complex tenses or idiomatic expressions.

    Example Outputs:
    - "Io bevo il caffè."
    - "Domani vado a scuola."
    - "Luca mangia una mela rossa."
    
    Return only the Italian sentence without additional explanations.
    """
    
    try:
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )
        italian_sentence = completion.choices[0].message.content.strip().strip('"')
        
        # Get English translation of the sentence
        translation_prompt = f"Translate this Italian sentence to English: '{italian_sentence}'"
        translation_completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": translation_prompt}]
        )
        english_translation = translation_completion.choices[0].message.content.strip().strip('"')
        
        return {
            "italian": italian_sentence,
            "english": english_translation,
            "focus_word": word
        }
    except Exception as e:
        st.error(f"Error generating sentence: {e}")
        return {
            "italian": f"Io uso la parola {word['italian']}.",
            "english": f"I use the word {word['english']}.",
            "focus_word": word
        }

def transcribe_image(image):
    """Transcribe Italian text from uploaded image using Tesseract OCR"""
    try:
        # Configure pytesseract for Italian language
        transcription = pytesseract.image_to_string(image, lang='ita')
        return transcription.strip()
    except Exception as e:
        st.error(f"Error transcribing image: {e}")
        return "Error transcribing image"

def translate_text(text):
    """Translate Italian text to English"""
    prompt = f"Translate this Italian text to English as literally as possible: '{text}'"
    try:
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        st.error(f"Error translating text: {e}")
        return "Error translating text"

def grade_attempt(original_english, transcribed_italian, translation):
    """Grade the user's attempt using LLM"""
    prompt = f"""
    Grade this Italian language learning attempt:
    
    Original English Sentence: "{original_english}"
    Student's Written Italian (transcribed): "{transcribed_italian}"
    Literal Translation of Student's Italian: "{translation}"
    
    Please grade using the S Rank system:
    - S: Perfect match in meaning with proper grammar
    - A: Excellent meaning match with minor grammatical errors
    - B: Good meaning match with some grammatical errors
    - C: Basic meaning conveyed but with significant errors
    - D: Some relevant words but incorrect meaning
    - F: Completely incorrect or incomprehensible
    
    Provide:
    1. The letter grade
    2. A brief explanation of whether the attempt was accurate and suggestions for improvement
    
    Format your response as:
    Grade: [letter]
    Feedback: [explanation and suggestions]
    """
    
    try:
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )
        result = completion.choices[0].message.content.strip()
        
        # Parse the grade and feedback
        lines = result.split('\n')
        grade = lines[0].replace('Grade:', '').strip()
        feedback = ' '.join([line.replace('Feedback:', '').strip() for line in lines[1:]])
        
        return {
            "grade": grade,
            "feedback": feedback
        }
    except Exception as e:
        st.error(f"Error grading attempt: {e}")
        return {
            "grade": "Error",
            "feedback": "Unable to grade due to system error."
        }

# Button callbacks
def on_generate_clicked():
    if not st.session_state.italian_english_words:
        st.write("Fetching new words...")  # Debug log
        group_id = "1"  # Default group ID
        words = fetch_words(group_id)
        if not words:
            st.error("Failed to fetch words. Please check if the API is running and the group exists.")
            return
        st.session_state.italian_english_words = words
    
    # Pick a random word
    if st.session_state.italian_english_words:
        random_word = random.choice(st.session_state.italian_english_words)
        st.session_state.current_sentence = generate_sentence(random_word)
        st.session_state.app_state = "practice"
        st.session_state.uploaded_image = None
    else:
        st.error("No words available to generate a sentence.")

def on_submit_clicked():
    if st.session_state.uploaded_image is None:
        st.error("Please upload an image first")
        return
    
    # Process the image
    image = Image.open(st.session_state.uploaded_image)
    transcription = transcribe_image(image)
    translation = translate_text(transcription)
    grading = grade_attempt(
        st.session_state.current_sentence["english"], 
        transcription, 
        translation
    )
    
    st.session_state.grade_results = {
        "original": {
            "english": st.session_state.current_sentence["english"],
            "italian": st.session_state.current_sentence["italian"]
        },
        "submission": {
            "transcription": transcription,
            "translation": translation,
            "grade": grading["grade"],
            "feedback": grading["feedback"]
        }
    }
    
    st.session_state.app_state = "review"

# Main UI
st.title("Italian Language Practice")

# Setup State
if st.session_state.app_state == "setup":
    st.write("Welcome to your Italian language practice!")
    st.write("Press the button below to generate a practice sentence.")
    
    st.button("Generate Sentence", on_click=on_generate_clicked)

# Practice State
elif st.session_state.app_state == "practice":
    st.write("### Your Practice Sentence")
    st.info(f"Translate to Italian: **{st.session_state.current_sentence['english']}**")
    st.caption(f"Focus word: *{st.session_state.current_sentence['focus_word']['italian']}* ({st.session_state.current_sentence['focus_word']['english']})")
    
    st.write("### Your Answer")
    st.write("Write your translation on paper, take a photo, and upload it here:")
    
    uploaded_file = st.file_uploader("Upload your handwritten Italian translation", type=["jpg", "jpeg", "png"])
    
    if uploaded_file is not None:
        # Store the uploaded file in session state
        st.session_state.uploaded_image = uploaded_file
        
        # Display image preview
        image = Image.open(uploaded_file)
        st.image(image, caption="Preview of your handwritten answer", width=400)
        
        st.button("Submit for Review", on_click=on_submit_clicked)

# Review State
elif st.session_state.app_state == "review":
    st.write("### Review")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.write("**Original Sentence:**")
        st.info(st.session_state.grade_results["original"]["english"])
        st.success(st.session_state.grade_results["original"]["italian"])
        
    with col2:
        st.write("**Your Submission:**")
        st.info(st.session_state.grade_results["submission"]["transcription"])
        st.success(st.session_state.grade_results["submission"]["translation"])
    
    st.write("### Grading")
    grade = st.session_state.grade_results["submission"]["grade"]
    feedback = st.session_state.grade_results["submission"]["feedback"]
    
    # Define grade colors
    grade_colors = {
        "S": "#FFD700",  # Gold
        "A": "#4CAF50",  # Green
        "B": "#2196F3",  # Blue
        "C": "#FFC107",  # Amber
        "D": "#FF9800",  # Orange
        "F": "#F44336",  # Red
    }
    
    # Get color for the grade (default to gray if not found)
    grade_color = grade_colors.get(grade, "#9E9E9E")
    
    # Display grade with colored box
    st.markdown(
        f"""
        <div style="display:flex;align-items:center;margin-bottom:20px">
            <div style="background-color:{grade_color};color:white;width:50px;height:50px;
                border-radius:50%;text-align:center;line-height:50px;font-weight:bold;
                font-size:1.5rem;margin-right:15px">
                {grade}
            </div>
            <div>{feedback}</div>
        </div>
        """,
        unsafe_allow_html=True
    )
    
    st.button("Next Question", on_click=on_generate_clicked)

# Initialize app on first load
if not st.session_state.italian_english_words:
    group_id = "1"  # Default group ID
    st.session_state.italian_english_words = fetch_words(group_id)