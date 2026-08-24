"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import type { AIDesignSpecification } from "@/lib/validations/ai-builder";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

type GenerateInput = {
  targetType: "link_in_bio" | "storefront";
  prompt: string;
  useCase?: string;
  referenceUrls?: string[];
  referenceImageUrls?: string[];
  links?: Array<{ platform?: string; url: string }>;
  existingPageId?: string;
};

type RegenerateInput = {
  targetType: "link_in_bio" | "storefront";
  prompt: string;
  existingDesignSpec: Record<string, unknown>;
  existingPageId?: string;
  operation?: string;
};

type GenerateResult = {
  id: string;
  designSpec: AIDesignSpecification;
};

export function useAIBuilder() {
  const [designSpec, setDesignSpec] = useState<AIDesignSpecification | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);

  const generate = useMutation({
    mutationFn: (input: GenerateInput) =>
      fetchJson<GenerateResult>("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onSuccess: (result) => {
      setDesignSpec(result.designSpec);
      setGenerationId(result.id);
    },
  });

  const regenerate = useMutation({
    mutationFn: (input: RegenerateInput) =>
      fetchJson<GenerateResult>("/api/ai/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onSuccess: (result) => {
      setDesignSpec(result.designSpec);
      setGenerationId(result.id);
    },
  });

  const apply = useMutation({
    mutationFn: (input: {
      targetType: "link_in_bio" | "storefront";
      designSpec: AIDesignSpecification;
      storefrontId?: string;
    }) =>
      fetchJson<{ success: boolean }>("/api/ai/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
  });

  const saveAsPreset = useMutation({
    mutationFn: (input: {
      designSpec: AIDesignSpecification;
      name: string;
      description?: string;
    }) =>
      fetchJson<unknown>("/api/ai/save-as-preset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
  });

  const reset = useCallback(() => {
    setDesignSpec(null);
    setGenerationId(null);
    generate.reset();
    regenerate.reset();
    apply.reset();
    saveAsPreset.reset();
  }, [generate, regenerate, apply, saveAsPreset]);

  return {
    designSpec,
    setDesignSpec,
    generationId,
    generate,
    regenerate,
    apply,
    saveAsPreset,
    reset,
    isGenerating: generate.isPending || regenerate.isPending,
    error: generate.error ?? regenerate.error,
  };
}
