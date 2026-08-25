import { env } from "@/lib/env";
import { GeminiProvider } from "@/lib/ai/providers/gemini";
import type { AIProvider, AIProviderConfig } from "@/lib/ai/types";

let cachedProvider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (cachedProvider) {
    return cachedProvider;
  }

  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured. Add it to your environment variables.");
  }

  const config: AIProviderConfig = {
    apiKey,
    model: "gemini-2.5-flash",
  };

  cachedProvider = new GeminiProvider(config);
  return cachedProvider;
}

export type {
  AIProvider,
  AIGenerationInput,
  AIGenerationResult,
  AIGenerationStructuredInput,
  AIGenerationStructuredResult,
  AIProviderConfig,
  AIGenerationTargetType,
  AIGenerationStatus,
  AIGenerationRequest,
  AIBioGenerationResult,
  AIStorefrontGenerationResult,
  AIOperationName,
  AIOperationContext,
  AIRateLimitResult,
  AICostInfo,
} from "@/lib/ai/types";
