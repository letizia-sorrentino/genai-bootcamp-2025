import { z } from "zod";

export const vocabularyPartSchema = z.object({
  part_of_speech: z.enum(['noun', 'verb', 'adjective'])
});

export const vocabularyWordSchema = z.object({
  id: z.number(),
  italian: z.string(),
  english: z.string(),
  parts: vocabularyPartSchema
});

export const vocabularyResponseSchema = z.object({
  words: z.array(vocabularyWordSchema)
});

export const grammarCategorySchema = z.object({
  category: z.enum(['nouns', 'verbs', 'adjectives'])
});

export type VocabularyWord = z.infer<typeof vocabularyWordSchema>;
export type VocabularyResponse = z.infer<typeof vocabularyResponseSchema>;
export type GrammarCategory = z.infer<typeof grammarCategorySchema>;