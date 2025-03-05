import type { Express } from "express";
import { createServer } from "http";
import { grammarCategorySchema, type VocabularyResponse } from "@shared/schema";
import {Groq} from "groq-sdk"; 

// For debugging purposes
console.log("Starting vocabulary generator service...");
console.log("Checking GROQ_API_KEY in routes:", {
  exists: !!process.env.GROQ_API_KEY,
  length: process.env.GROQ_API_KEY?.length || 0
});

// Grammar-specific prompts for better context
const PROMPTS = {
  nouns: "Generate a list of 10 Italian nouns with their English translations. Focus on common, everyday nouns.",
  verbs: "Generate a list of 10 Italian verbs in their infinitive form with English translations. Focus on common, everyday actions.",
  adjectives: "Generate a list of 10 Italian adjectives with their English translations. Focus on common descriptive words."
};

// Sample responses for fallback
const sampleResponses: Record<string, VocabularyResponse> = {
  nouns: {
    words: [
      {
        id: 1,
        italian: "libro",
        english: "book",
        parts: {
          part_of_speech: "noun"
        }
      },
      {
        id: 2,
        italian: "casa",
        english: "house",
        parts: {
          part_of_speech: "noun"
        }
      }
    ]
  },
  verbs: {
    words: [
      {
        id: 1,
        italian: "mangiare",
        english: "to eat",
        parts: {
          part_of_speech: "verb"
        }
      },
      {
        id: 2,
        italian: "dormire",
        english: "to sleep",
        parts: {
          part_of_speech: "verb"
        }
      }
    ]
  },
  adjectives: {
    words: [
      {
        id: 1,
        italian: "bello",
        english: "beautiful",
        parts: {
          part_of_speech: "adjective"
        }
      },
      {
        id: 2,
        italian: "grande",
        english: "big",
        parts: {
          part_of_speech: "adjective"
        }
      }
    ]
  }
};

export async function registerRoutes(app: Express) {
  app.post("/api/generate-vocabulary", async (req, res) => {
    try {
      console.log("Received vocabulary generation request");
      console.log("Request body:", req.body);
      const { category, useAI = false } = grammarCategorySchema.parse(req.body);
      console.log("Parsed request:", { category, useAI });

      // If useAI is false, return sample response
      if (!useAI) {
        console.log("Using sample response");
        const response = sampleResponses[category] || sampleResponses.nouns;
        return res.json(response);
      }

      try {
        // Only proceed with API call if useAI is true
        console.log("Making Groq API call");
        const apiKey = process.env.GROQ_API_KEY;
        
        if (!apiKey) {
          throw new Error("GROQ_API_KEY is not set");
        }

        console.log("Initializing Groq client");
        // Create client using the correct instantiation pattern for the Groq SDK
        const groq = new Groq({ apiKey });

        // Optional: List available models to help with debugging
        /*
        try {
          const models = await groq.models.list();
          console.log("Available models:", models.data.map(m => m.id));
        } catch (error) {
          console.warn("Could not fetch available models:", error);
        }
        */

        // Use the prompt that matches the requested category
        const promptContent = PROMPTS[category] || PROMPTS.nouns;
        
        console.log("Sending request to Groq API");
        // List of models to try in order of preference
        const modelOptions = [
          "llama3-70b-8192",
          "claude-3-opus-20240229",
          "mixtral-8x7b-32768",
          "gemma-7b-it"
        ];
        
        let completion;
        let modelError;
        
        // Try each model until one works
        for (const modelName of modelOptions) {
          try {
            console.log(`Attempting to use model: ${modelName}`);
            completion = await groq.chat.completions.create({
              messages: [
                {
                  role: "system",
                  content: "You are an Italian language assistant. Generate vocabulary in JSON format."
                },
                {
                  role: "user",
                  content: `${promptContent} Format:
                  {
                    "words": [
                      {
                        "id": number (1-5),
                        "italian": "word",
                        "english": "translation",
                        "parts": {
                          "part_of_speech": "${category.slice(0, -1)}"
                        }
                      }
                    ]
                  }`
                }
              ],
              model: modelName,
              temperature: 0.7,
              max_tokens: 500,
              response_format: { type: "json_object" }
            });
            
            // If we get here, the model worked
            console.log(`Successfully used model: ${modelName}`);
            break;
          } catch (error) {
            modelError = error;
            console.warn(`Model ${modelName} failed:`, error instanceof Error ? error.message : String(error));
            // Continue to try the next model
          }
        }
        
        // If all models failed, throw the last error
        if (!completion) {
          console.error("All models failed");
          throw modelError || new Error("Failed to use any available model");
        }

        const result = completion.choices[0]?.message?.content;

        if (!result) {
          throw new Error("No response from Groq API");
        }

        // Parse result with proper error handling
        let parsedResult;
        try {
          parsedResult = JSON.parse(result);
          
          // Validate the structure matches expected format
          if (!parsedResult.words || !Array.isArray(parsedResult.words)) {
            throw new Error("Invalid response format from Groq API");
          }
          
        } catch (parseError) {
          console.error("Error parsing Groq API response:", parseError);
          throw new Error("Failed to parse Groq API response");
        }

        res.json(parsedResult);
      } catch (error) {
        console.error("Groq API error:", error);
        // Fallback to sample responses if API fails
        const response = sampleResponses[category] || sampleResponses.nouns;
        res.json(response);
      }
    } catch (error) {
      console.error("Vocabulary generation error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate vocabulary" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}