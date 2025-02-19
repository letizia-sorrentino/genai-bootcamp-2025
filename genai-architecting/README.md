# GenAI Architecture

## Overview
This document provides an overview of the Generative AI (GenAI) architecture to support study activities of a Italian Language Portal. The system is designed to facilitate user interactions through a frontend interface, leveraging a Retrieval-Augmented Generation (RAG) system to improve the response generation process.

## System Components

### 1. Users
Users interact with the system by submitting queries through the frontend. 

### 2. Frontend
The frontend acts as an interface between users and the backend study activity. It sends user queries to the backend and returns generated responses.

### 3. Study Activity Module (Backend)
This module processes user queries using a combination of retrieval and generative AI techniques. It consists of the following components:

#### a. RAG (Retrieval-Augmented Generation)
- Retrieves relevant contextual information from a **Database**  or external sources such as the  **Internet**.

#### b. Prompt Cache
- Caches frequently used prompts and query responses to optimise processing and enhance response efficiency

#### c. Input Guardrails
- Filters inappropriate or irrelevant queries and enforces predefined constraints.

#### d. Model API & Generation
- Uses a generative AI model to create responses based on the processed inputs.

#### e. Output Guardrails
- Applies validation and safety checks on generated responses before returning them to the frontend.

## Data Flow
1. **Users** submit a **query** via the **Frontend**.
2. The **Frontend** forwards the query to the **RAG** module.
3. The **RAG** module retrieves relevant contextual data from a **Database** or the **Internet**.
4. The retrieved data is stored or referenced in a **Prompt Cache**.
5. The **Input Guardrails** filter and validate the input before sending it to the **Model API**.
6. The **Model API** generates a response using a generative AI model.
7. The **Output Guardrails** check the response for quality, accuracy, and compliance.
8. The validated response is sent back to the **Frontend**.
9. The **Frontend** displays the response to the **Users**.

---