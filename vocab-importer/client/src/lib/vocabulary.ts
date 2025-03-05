import { apiRequest } from "./queryClient";
import type { VocabularyResponse } from "@shared/schema";

export async function generateVocabulary(category: string): Promise<VocabularyResponse> {
  const res = await apiRequest("POST", "/api/generate-vocabulary", { category });
  return res.json();
}
