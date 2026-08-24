import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/lib/env";

let client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  if (!client) {
    client = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }
  return client;
}

export interface GenerateOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxOutputTokens?: number;
}

export async function generateJSON<T>(options: GenerateOptions): Promise<T> {
  const ai = getClient();
  const model = ai.getGenerativeModel({
    model: "gemini-3.6-flash",
    systemInstruction: options.systemPrompt,
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxOutputTokens ?? 8192,
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(options.userPrompt);
  const text = result.response.text();

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("AI returned invalid JSON. Please try again.");
  }
}

export async function generateText(options: GenerateOptions): Promise<string> {
  const ai = getClient();
  const model = ai.getGenerativeModel({
    model: "gemini-3.6-flash",
    systemInstruction: options.systemPrompt,
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxOutputTokens ?? 8192,
    },
  });

  const result = await model.generateContent(options.userPrompt);
  return result.response.text();
}

export function isGeminiConfigured(): boolean {
  return !!env.GEMINI_API_KEY;
}
