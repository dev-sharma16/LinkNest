import type { AICostInfo } from "@/lib/ai/types";

const PRICING: Record<string, { inputPer1M: number; outputPer1M: number }> = {
  "gemini-2.5-flash": { inputPer1M: 0.075, outputPer1M: 0.3 },
  "gemini-2.5-pro": { inputPer1M: 1.25, outputPer1M: 10 },
  "gemini-2.0-flash": { inputPer1M: 0.1, outputPer1M: 0.4 },
};

export function estimateCost(
  provider: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const pricing = PRICING[model];
  if (!pricing) {
    return 0;
  }

  const inputCost = (inputTokens / 1_000_000) * pricing.inputPer1M;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputPer1M;

  return Math.round((inputCost + outputCost) * 1_000_000) / 1_000_000;
}

export function trackGeneration(input: {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
}): AICostInfo {
  const estimatedCost = estimateCost(
    input.provider,
    input.model,
    input.inputTokens,
    input.outputTokens,
  );

  return {
    provider: input.provider,
    model: input.model,
    inputTokens: input.inputTokens,
    outputTokens: input.outputTokens,
    estimatedCost,
  };
}

export function getModelPricing(model: string): { inputPer1M: number; outputPer1M: number } | null {
  return PRICING[model] ?? null;
}

export function getAllModels(): Array<{ model: string; inputPer1M: number; outputPer1M: number }> {
  return Object.entries(PRICING).map(([model, pricing]) => ({
    model,
    ...pricing,
  }));
}
