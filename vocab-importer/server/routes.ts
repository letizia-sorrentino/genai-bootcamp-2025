import type { Express } from "express";
import { createServer } from "http";
import { grammarCategorySchema, type VocabularyResponse } from "@shared/schema";
import Groq from "groq";

// For debugging purposes
console.log("Starting vocabulary generator service...");

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
      const { category } = grammarCategorySchema.parse(req.body);
      console.log("Processing grammar category:", category);

      try {
        // Initialize Groq client within the route handler
        if (!process.env.GROQ_API_KEY) {
          throw new Error("GROQ_API_KEY is not set");
        }

        console.log("Initializing Groq client with API key length:", process.env.GROQ_API_KEY.length);
        const groq = Groq({
          apiKey: process.env.GROQ_API_KEY
        });

        const completion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: "You are a helpful Italian language assistant. Respond only with valid JSON in the specified format."
            },
            {
              role: "user",
              content: `${PROMPTS[category]}
              Return the response in this exact JSON format:
              {
                "words": [
                  {
                    "id": number (1-10),
                    "italian": "italian word",
                    "english": "english translation",
                    "parts": {
                      "part_of_speech": "${category.slice(0, -1)}"
                    }
                  }
                ]
              }`
            }
          ],
          model: "mixtral-8x7b-32768",
          temperature: 0.7,
          max_tokens: 1000,
          response_format: { type: "json_object" }
        });

        const result = completion.choices[0]?.message?.content;

        if (!result) {
          throw new Error("No response from Groq API");
        }

        const parsedResult = JSON.parse(result);
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