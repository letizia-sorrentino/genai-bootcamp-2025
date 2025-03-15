# Italian Language Learning Application (Streamlit)

This is a Streamlit-based application for practicing Italian language skills. The app allows users to practice translating English sentences to Italian by writing them down, taking a picture, and receiving automated feedback.

## Features

- Generates simple Italian practice sentences based on vocabulary words
- Uses OCR to transcribe handwritten Italian text
- Provides translation of the transcribed text
- Grades the attempt using an S-Rank grading system
- Offers suggestions for improvement

## Technical Requirements

- Python 3.8+
- Streamlit
- pytesseract (with Tesseract OCR installed)
- OpenAI API key (for sentence generation and grading)
- Internet connection for API access

## Installation

1. Clone this repository
2. Install required Python packages:

```bash
pip install streamlit requests pillow pytesseract openai
```

3. Install Tesseract OCR:
   - For Windows: Download and install from https://github.com/UB-Mannheim/tesseract/wiki
   - For macOS: `brew install tesseract`
   - For Ubuntu: `sudo apt-get install tesseract-ocr`
   - Also install the Italian language pack for Tesseract

4. Set up your OpenAI API key as an environment variable:

```bash
# For Linux/macOS
export OPENAI_API_KEY='your-api-key-here'

# For Windows
set OPENAI_API_KEY=your-api-key-here
```

5. Make sure the external API at `localhost:5000/api/groups/:id/raw` is running to provide the vocabulary words.

## Project Structure

```
italian-learning-app/
│
├── app.py                  # Main Streamlit application
└── README.md               # This file
```

## Running the Application

1. Start the external vocabulary API (not included in this repository)
2. Run the Streamlit application:

```bash
streamlit run app.py
```

3. Your default web browser will automatically open with the application

## How to Use

1. When the app loads, click "Generate Sentence" to get an English sentence to translate
2. Write down the Italian translation on paper
3. Take a photo of your written Italian and upload it
4. Click "Submit for Review" to get feedback
5. Review your grade and feedback
6. Click "Next Question" to continue practicing

## Grading System

The app uses an S-Rank grading system:
- S: Perfect match in meaning with proper grammar
- A: Excellent meaning match with minor grammatical errors
- B: Good meaning match with some grammatical errors
- C: Basic meaning conveyed but with significant errors
- D: Some relevant words but incorrect meaning
- F: Completely incorrect or incomprehensible

## Advantages of Streamlit

- Simple, Python-only implementation
- Built-in session state management
- Automatic UI updates without page refreshes
- Easy deployment options
- Responsive design that works on mobile and desktop

## Notes for Deployment

- For production use, consider deploying on Streamlit Cloud
- You may need to adjust file paths for Tesseract OCR installation based on your system
- For larger deployments, consider using Streamlit's authentication options