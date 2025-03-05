declare module 'groq' {
  interface GroqConfig {
    apiKey: string;
  }

  interface GroqClient {
    chat: {
      completions: {
        create: (params: {
          messages: Array<{
            role: string;
            content: string;
          }>;
          model: string;
          temperature?: number;
          max_tokens?: number;
          response_format?: { type: string };
        }) => Promise<{
          choices: Array<{
            message: {
              content: string;
            };
          }>;
        }>;
      };
    };
  }

  function Groq(config: GroqConfig): GroqClient;
  export default Groq;
} 