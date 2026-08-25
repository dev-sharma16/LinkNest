import type { z } from "zod";

export type AIProvider = {
  readonly name: string;
  readonly model: string;
  generate(input: AIGenerationInput): Promise<AIGenerationResult>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generateStructured<T = any>(input: AIGenerationStructuredInput<T>): Promise<AIGenerationStructuredResult<T>>;
};

export type AIGenerationInput = {
  prompt: string;
  systemInstruction?: string;
  maxOutputTokens?: number;
  temperature?: number;
};

export type AIGenerationResult = {
  text: string;
  inputTokens: number;
  outputTokens: number;
  finishReason: string;
};

export type AIGenerationStructuredInput<T> = AIGenerationInput & {
  schema: z.ZodType<T>;
  responseMimeType?: "application/json";
};

export type AIGenerationStructuredResult<T> = {
  data: T;
  inputTokens: number;
  outputTokens: number;
  finishReason: string;
};

export type AIProviderConfig = {
  apiKey: string;
  model?: string;
  maxOutputTokens?: number;
  temperature?: number;
};

export type AIGenerationTargetType = "bio" | "storefront";

export type AIGenerationStatus = "pending" | "processing" | "completed" | "failed" | "cancelled";

export type AIGenerationRequest = {
  targetType: AIGenerationTargetType;
  prompt: string;
  useCase?: string;
  referenceURLs?: string[];
  referenceImages?: string[];
};

export type AIBioGenerationResult = {
  profile: {
    displayName?: string;
    bio?: string;
    avatar?: string;
    location?: string;
    website?: string;
  };
  socialLinks: Array<{
    platform: string;
    url: string;
  }>;
  blocks: Array<{
    type: string;
    config: Record<string, unknown>;
    order: number;
  }>;
  theme: Record<string, unknown>;
};

export type AIStorefrontGenerationResult = {
  storefront: {
    name?: string;
    description?: string;
    coverImage?: string;
    bannerImage?: string;
  };
  products: Array<{
    title: string;
    description?: string;
    image?: string;
    url: string;
    ctaText?: string;
    featured?: boolean;
  }>;
  theme: Record<string, unknown>;
};

export type AIOperationName =
  | "create"
  | "update"
  | "delete"
  | "reorder"
  | "duplicate"
  | "move"
  | "restyle"
  | "generate"
  | "analyze"
  | "organize"
  | "optimize";

export type AIOperationContext = {
  userId: string;
  targetType: AIGenerationTargetType;
  targetId?: string;
};

export type AIRateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

export type AICostInfo = {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
};
