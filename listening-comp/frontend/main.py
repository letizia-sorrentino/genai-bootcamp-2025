import streamlit as st
from typing import Dict
import json
from collections import Counter
import re
import sys
import os
import requests
import tempfile

# Ensure Python recognises the parent directory (listening-comp) as part of the path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.chat import BedrockChat


# Page config
st.set_page_config(
    page_title="Italian Learning Assistant",
    page_icon="🇮🇹",
    layout="wide"
)

# Initialize session state
if 'transcript' not in st.session_state:
    st.session_state.transcript = None
if 'messages' not in st.session_state:
    st.session_state.messages = []

def render_header():
    """Render the header section"""
    st.title("🇮🇹 Italian Learning Assistant")
    st.markdown("""
    Transform YouTube transcripts into interactive Italian learning experiences.
    
    This tool demonstrates:
    - Base LLM Capabilities
    - RAG (Retrieval Augmented Generation)
    - Amazon Bedrock Integration
    - Agent-based Learning Systems
    """)

def render_sidebar():
    """Render the sidebar with component selection"""
    with st.sidebar:
        st.header("Development Stages")
        
        # Main component selection
        selected_stage = st.radio(
            "Select Stage:",
            [
                "1. Chat with Nova",
                "2. Raw Transcript",
                "3. Structured Data",
                "4. RAG Implementation",
                "5. Interactive Learning"
            ]
        )
        
        # Stage descriptions
        stage_info = {
            "1. Chat with Nova": """
            **Current Focus:**
            - Basic Italian learning
            - Understanding LLM capabilities
            - Identifying limitations
            """,
            
            "2. Raw Transcript": """
            **Current Focus:**
            - YouTube transcript download
            - Raw text visualization
            - Initial data examination
            """,
            
            "3. Structured Data": """
            **Current Focus:**
            - Text cleaning
            - Dialogue extraction
            - Data structuring
            """,
            
            "4. RAG Implementation": """
            **Current Focus:**
            - Bedrock embeddings
            - Vector storage
            - Context retrieval
            """,
            
            "5. Interactive Learning": """
            **Current Focus:**
            - Scenario generation
            - Audio synthesis
            - Interactive practice
            """
        }
        
        st.markdown("---")
        st.markdown(stage_info[selected_stage])
        
        return selected_stage

def render_chat_stage():
    """Render an improved chat interface"""
    st.header("Chat with Nova")

    # Initialize BedrockChat instance if not in session state
    if 'bedrock_chat' not in st.session_state:
        st.session_state.bedrock_chat = BedrockChat()

    # Introduction text
    st.markdown("""
    Start by exploring Nova's base Italian language capabilities. Try asking questions about Italian grammar, 
    vocabulary, or cultural aspects.
    """)

    # Initialize chat history if not exists
    if "messages" not in st.session_state:
        st.session_state.messages = []

    # Display chat messages
    for message in st.session_state.messages:
        with st.chat_message(message["role"], avatar="🧑‍💻" if message["role"] == "user" else "🤖"):
            st.markdown(message["content"])

    # Chat input area
    if prompt := st.chat_input("Ask about Italian language..."):
        # Process the user input
        process_message(prompt)

    # Example questions in sidebar
    with st.sidebar:
        st.markdown("### Try These Examples")
        example_questions = [
            "How do I say 'Where is the train station?' in Italian?",
            "Explain the difference between 'essere' and 'avere'",
            "What's the polite form of 'mangiare'?",
            "How do I count objects in Italian?",
            "What's the difference between 'buongiorno' and 'buonasera'?",
            "How do I ask for directions politely?"
        ]
        
        for q in example_questions:
            if st.button(q, use_container_width=True, type="secondary"):
                # Process the example question
                process_message(q)
                st.rerun()

    # Add a clear chat button
    if st.session_state.messages:
        if st.button("Clear Chat", type="primary"):
            st.session_state.messages = []
            st.rerun()

def process_message(message: str):
    """Process a message and generate a response"""
    # Add user message to state and display
    st.session_state.messages.append({"role": "user", "content": message})
    with st.chat_message("user", avatar="🧑‍💻"):
        st.markdown(message)

    # Generate and display assistant's response
    with st.chat_message("assistant", avatar="🤖"):
        response = st.session_state.bedrock_chat.generate_response(message)
        if response:
            st.markdown(response)
            st.session_state.messages.append({"role": "assistant", "content": response})

def count_characters(text):
    """Count Italian and total characters in text"""
    if not text:
        return 0, 0
        
    def is_italian(char):
        # Italian characters include accented vowels and special characters
        return any([
            char in 'àèéìíòóùú',  # Accented vowels
            char in 'ÀÈÉÌÍÒÓÙÚ',  # Capital accented vowels
            char in 'çÇ',         # Special characters
        ])
    
    it_chars = sum(1 for char in text if is_italian(char))
    return it_chars, len(text)

def render_transcript_stage():
    """Render the raw transcript stage"""
    st.header("Raw Transcript Processing")
    
    # URL input
    url = st.text_input(
        "YouTube URL",
        placeholder="Enter an Italian lesson YouTube URL"
    )
    
    # Download button and processing
    if url:
        if st.button("Download Transcript"):
            try:
                downloader = YouTubeTranscriptDownloader()
                transcript = downloader.get_transcript(url)
                if transcript:
                    # Store the raw transcript text in session state
                    transcript_text = "\n".join([entry['text'] for entry in transcript])
                    st.session_state.transcript = transcript_text
                    st.success("Transcript downloaded successfully!")
                else:
                    st.error("No transcript found for this video.")
            except Exception as e:
                st.error(f"Error downloading transcript: {str(e)}")

    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Raw Transcript")
        if st.session_state.transcript:
            st.text_area(
                label="Raw text",
                value=st.session_state.transcript,
                height=400,
                disabled=True
            )
        else:
            st.info("No transcript loaded yet")
    
    with col2:
        st.subheader("Transcript Stats")
        if st.session_state.transcript:
            # Calculate stats
            it_chars, total_chars = count_characters(st.session_state.transcript)
            total_lines = len(st.session_state.transcript.split('\n'))
            
            # Display stats
            st.metric("Total Characters", total_chars)
            st.metric("Italian Characters", it_chars)
            st.metric("Total Lines", total_lines)
        else:
            st.info("Load a transcript to see statistics")

def render_structured_stage():
    """Render the structured data stage"""
    st.header("Structured Data Processing")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Dialogue Extraction")
        # Placeholder for dialogue processing
        st.info("Dialogue extraction will be implemented here")
        
    with col2:
        st.subheader("Data Structure")
        # Placeholder for structured data view
        st.info("Structured data view will be implemented here")

def render_rag_stage():
    """Render the RAG implementation stage"""
    st.header("Question Generation with RAG")
    
    # Topic input
    topic = st.text_input(
        "Topic",
        placeholder="Enter a topic (e.g., 'verb conjugation', 'prepositions', 'articles'...)"
    )
    
    # Section selection (optional)
    section_num = st.number_input("Section Number", min_value=1, value=1)
    
    # Generate button
    if topic and st.button("Generate Question", type="primary"):
        with st.spinner("Generating question..."):
            try:
                # Make API call to our backend
                response = requests.post(
                    "http://localhost:8000/api/generate-question",
                    json={"topic": topic, "section_num": section_num}
                )
                
                if response.status_code == 200:
                    question_data = response.json()
                    
                    # Display the generated question
                    st.subheader("Generated Question")
                    st.write(question_data["question"])
                    
                    # Display options
                    st.subheader("Options")
                    selected_option = st.radio(
                        "Choose your answer:",
                        question_data["options"],
                        key="question_options"
                    )
                    
                    # Check answer button
                    if st.button("Check Answer"):
                        if selected_option == question_data["answer"]:
                            st.success("Correct! 🎉")
                        else:
                            st.error("Not quite right. Try again!")
                        
                        # Show explanation
                        st.info(f"Explanation: {question_data['explanation']}")
                else:
                    st.error(f"Error: {response.json().get('detail', 'Failed to generate question')}")
                    
            except Exception as e:
                st.error(f"Error connecting to backend: {str(e)}")
    
    # Add some example topics
    with st.sidebar:
        st.markdown("### Example Topics")
        example_topics = [
            "verb conjugation",
            "prepositions with cities",
            "definite articles",
            "plural nouns",
            "reflexive verbs",
            "past tense"
        ]
        
        st.markdown("Click any topic to try it:")
        for topic in example_topics:
            if st.button(topic, key=f"topic_{topic}", use_container_width=True):
                # This will set the topic in the main input
                st.session_state["topic"] = topic
                st.rerun()

def render_interactive_stage():
    """Render the interactive learning stage"""
    st.header("Interactive Learning")
    
    # Practice type selection
    practice_type = st.selectbox(
        "Select Practice Type",
        ["Question Practice", "Dialogue Practice", "Vocabulary Quiz", "Listening Exercise"]
    )
    
    if practice_type == "Question Practice":
        # Section selection
        st.subheader("Select Section")
        selected_section = st.selectbox(
            "Section",
            ["All Sections"]
        )
        
        # Initialize question index in session state if not exists
        if 'question_index' not in st.session_state:
            st.session_state.question_index = 0
            
        # Fetch questions from backend
        try:
            # Only fetch from practice-questions endpoint which includes fallback questions
            response = requests.get("http://localhost:8000/api/practice-questions")
            
            all_questions = []
            if response.status_code == 200:
                all_questions = response.json()
            
            if all_questions:
                # Get current question
                current_question = all_questions[st.session_state.question_index]
                
                # Display question
                st.subheader("Practice Question")
                
                # Audio controls
                col1, col2 = st.columns([3, 1])
                with col1:
                    st.write(current_question["question"])
                with col2:
                    if st.button("🔊 Listen"):
                        try:
                            with st.spinner("Generating audio..."):
                                # Get audio file
                                audio_response = requests.get(
                                    f"http://localhost:8000/api/question-audio/{current_question['id']}",
                                    stream=True
                                )
                                
                                if audio_response.status_code == 200:
                                    # Save audio to temporary file
                                    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as f:
                                        for chunk in audio_response.iter_content(chunk_size=8192):
                                            if chunk:
                                                f.write(chunk)
                                        
                                        # Play audio using st.audio
                                        st.audio(f.name, format='audio/mp3')
                                else:
                                    error_detail = audio_response.json().get('detail', 'Unknown error')
                                    st.error(f"Failed to generate audio: {error_detail}")
                                    if "ffmpeg is not installed" in error_detail:
                                        st.info("Please install ffmpeg to enable audio generation:\n```brew install ffmpeg```")
                                    elif "Failed to initialize AWS clients" in error_detail:
                                        st.info("Please configure your AWS credentials to enable audio generation.")
                        except Exception as e:
                            st.error(f"Error playing audio: {str(e)}")
                
                # Display options
                if "options" in current_question:
                    options = current_question["options"]
                    if isinstance(options, str):
                        options = options.split(",")
                    
                    # Create radio buttons for options
                    selected_option = st.radio(
                        "Select your answer:",
                        options,
                        key="answer_selection"
                    )
                    
                    # Check answer button
                    if st.button("Check Answer"):
                        if selected_option == current_question["answer"]:
                            st.success("🎉 Correct! Well done!")
                            st.info(f"Explanation: {current_question['explanation']}")
                        else:
                            st.error("❌ Not quite right. Try again!")
                            if st.button("Show Explanation"):
                                st.info(f"Explanation: {current_question['explanation']}")
                
                # Navigation
                col1, col2, col3 = st.columns([1, 2, 1])
                
                with col1:
                    if st.button("⬅️ Previous") and st.session_state.question_index > 0:
                        st.session_state.question_index -= 1
                        st.rerun()
                
                with col2:
                    st.write(f"Question {st.session_state.question_index + 1} of {len(all_questions)}")
                
                with col3:
                    if st.button("Next ➡️") and st.session_state.question_index < len(all_questions) - 1:
                        st.session_state.question_index += 1
                        st.rerun()
                
            else:
                st.warning("No questions available. Try generating some questions first!")
                
        except Exception as e:
            st.error(f"Error connecting to backend: {str(e)}")
    else:
        st.info("This practice type is not implemented yet.")

def main():
    render_header()
    selected_stage = render_sidebar()
    
    # Render appropriate stage
    if selected_stage == "1. Chat with Nova":
        render_chat_stage()
    elif selected_stage == "2. Raw Transcript":
        render_transcript_stage()
    elif selected_stage == "3. Structured Data":
        render_structured_stage()
    elif selected_stage == "4. RAG Implementation":
        render_rag_stage()
    elif selected_stage == "5. Interactive Learning":
        render_interactive_stage()
    
    # Debug section at the bottom
    with st.expander("Debug Information"):
        st.json({
            "selected_stage": selected_stage,
            "transcript_loaded": st.session_state.transcript is not None,
            "chat_messages": len(st.session_state.messages)
        })

if __name__ == "__main__":
    main()