# Technical Specs

## Initialization Step

When the app first initializes, it needs to do the following:  
Fetch from `GET localhost:5000/api/groups/:id/raw`. This will return a collection of words in a JSON structure. It will have **Italian** words with their English translations. We need to store this collection of words in memory.

## Page States

Page states describe how the single-page application should behave from a user’s perspective.

### Setup State

When a user first starts up the app:  
- They will only see a button called **“Generate Sentence.”**  
- When they press the button, the app will generate a sentence using the **Sentence Generator LLM**, and the state will move to the **Practice State**.

### Practice State

When a user is in the practice state:  
- They will see an **English sentence**.  
- They will also see an **upload field** under the English sentence.  
- They will see a button called **“Submit for Review.”**  
- When they press the **“Submit for Review”** button, the uploaded image will be passed to the **Grading System**, and the state will transition to the **Review State**.

### Review State

When a user is in the review state:  
- The user will still see the **English sentence**.  
- The upload field will be **gone**.  
- The user will now see a **review of the output** from the **Grading System**:  
  - **Transcription of the Image**  
  - **Translation of the Transcription**  
  - **Grading:**  
    - A letter score using the **S Rank** system.  
    - A description of whether the attempt was **accurate** to the English sentence and suggestions for improvement.  
- There will be a button called **“Next Question.”** When clicked, it will generate a new question and place the app into the **Practice State**.

---

## Sentence Generator LLM Prompt  

### **Improved Prompt:**  

**Generate a simple Italian sentence using the word: `{{word}}`.**  

- The sentence should follow **A1-level Italian grammar**, using:  
  - **Basic subject-verb-object structures** (e.g., *"Io mangio la pizza."*)  
  - **Common present-tense verbs** (e.g., *"mangiare," "bere," "andare"*)  
  - **Basic adjectives and adverbs** for more natural sentences (e.g., *"buono," "velocemente"*)  
  - **Simple negation** (e.g., *"Non ho un cane."*)  
- The sentence should be **between 4-8 words long** for simplicity.  
- Do not use complex tenses or idiomatic expressions.  

**Example Outputs:**  
- *"Io bevo il caffè."*  
- *"Domani vado a scuola."*  
- *"Luca mangia una mela rossa."*  

---

## Grading System

The **Grading System** will do the following:  
- It will **transcribe the image** using **Tesseract OCR**.  
- It will use an **LLM** to produce a **literal translation** of the transcription.  
- It will use another **LLM** to produce a **grade**.  
- It will then return this **data to the frontend app**.  