import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";
import type {
  AIProvider,
  AIGenerationInput,
  AIGenerationResult,
  AIGenerationStructuredInput,
  AIGenerationStructuredResult,
  AIProviderConfig,
} from "@/lib/ai/types";

const DEFAULT_MODEL = "gemini-2.5-flash";
const DEFAULT_MAX_OUTPUT_TOKENS = 8192;
const DEFAULT_TEMPERATURE = 0.7;

export class GeminiProvider implements AIProvider {
  readonly name = "gemini";
  readonly model: string;

  private client: GoogleGenerativeAI;
  private maxOutputTokens: number;
  private temperature: number;

  constructor(config: AIProviderConfig) {
    this.client = new GoogleGenerativeAI(config.apiKey);
    this.model = config.model ?? DEFAULT_MODEL;
    this.maxOutputTokens = config.maxOutputTokens ?? DEFAULT_MAX_OUTPUT_TOKENS;
    this.temperature = config.temperature ?? DEFAULT_TEMPERATURE;
  }

  private getModel(overrides?: { maxOutputTokens?: number; temperature?: number }): GenerativeModel {
    return this.client.getGenerativeModel({
      model: this.model,
      generationConfig: {
        maxOutputTokens: overrides?.maxOutputTokens ?? this.maxOutputTokens,
        temperature: overrides?.temperature ?? this.temperature,
      },
    });
  }

  async generate(input: AIGenerationInput): Promise<AIGenerationResult> {
    const model = this.getModel({
      maxOutputTokens: input.maxOutputTokens,
      temperature: input.temperature,
    });

    const content = input.prompt;
    const systemInstruction = input.systemInstruction
      ? { role: "system" as const, parts: [{ text: input.systemInstruction }] }
      : undefined;

    const result = await model.generateContent({
      contents: systemInstruction
        ? [systemInstruction, { role: "user", parts: [{ text: content }] }]
        : [{ role: "user", parts: [{ text: content }] }],
    });

    const response = result.response;
    const text = response.text();
    const usage = response.usageMetadata;

    return {
      text,
      inputTokens: usage?.promptTokenCount ?? 0,
      outputTokens: usage?.candidatesTokenCount ?? 0,
      finishReason: response.candidates?.[0]?.finishReason ?? "UNKNOWN",
    };
  }

  async generateStructured<T>(
    input: AIGenerationStructuredInput<T>,
  ): Promise<AIGenerationStructuredResult<T>> {
    const geminiSchema = zodToGeminiSchema(input.schema);

    const model = this.client.getGenerativeModel({
      model: this.model,
      generationConfig: {
        maxOutputTokens: input.maxOutputTokens ?? this.maxOutputTokens,
        temperature: input.temperature ?? this.temperature,
        responseMimeType: "application/json",
        responseSchema: geminiSchema as never,
      },
    });

    const content = input.prompt;
    const systemInstruction = input.systemInstruction
      ? { role: "system" as const, parts: [{ text: input.systemInstruction }] }
      : undefined;

    const result = await model.generateContent({
      contents: systemInstruction
        ? [systemInstruction, { role: "user", parts: [{ text: content }] }]
        : [{ role: "user", parts: [{ text: content }] }],
    });

    const response = result.response;
    const rawText = response.text();
    const usage = response.usageMetadata;

    const data = JSON.parse(rawText) as T;

    return {
      data,
      inputTokens: usage?.promptTokenCount ?? 0,
      outputTokens: usage?.candidatesTokenCount ?? 0,
      finishReason: response.candidates?.[0]?.finishReason ?? "UNKNOWN",
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ZodSchemaAny = { _def?: any; shape?: any };

function zodToGeminiSchema(schema: unknown): Record<string, unknown> {
  const s = schema as ZodSchemaAny;

  if (!s?._def) {
    return { type: "STRING" };
  }

  const typeName = s._def.typeName as string | undefined;

  switch (typeName) {
    case "ZodString":
      return { type: "STRING" };
    case "ZodNumber":
      return { type: "NUMBER" };
    case "ZodBoolean":
      return { type: "BOOLEAN" };
    case "ZodLiteral":
      return { type: "STRING", enum: [String(s._def.value)] };
    case "ZodEnum":
      return { type: "STRING", enum: s._def.values as string[] };
    case "ZodOptional": {
      const inner = s._def.innerType as ZodSchemaAny;
      return { ...zodToGeminiSchema(inner), nullable: true };
    }
    case "ZodDefault": {
      const inner = s._def.innerType as ZodSchemaAny;
      return zodToGeminiSchema(inner);
    }
    case "ZodArray": {
      const inner = s._def.type as ZodSchemaAny;
      return { type: "ARRAY", items: zodToGeminiSchema(inner) };
    }
    case "ZodObject": {
      const shape = s.shape ?? s._def.shape;
      if (!shape || typeof shape !== "object") {
        return { type: "OBJECT" };
      }
      const properties: Record<string, unknown> = {};
      const required: string[] = [];
      for (const [key, val] of Object.entries(shape)) {
        const fieldSchema = zodToGeminiSchema(val);
        properties[key] = fieldSchema;
        const fieldDef = val as ZodSchemaAny;
        if (fieldDef._def?.typeName !== "ZodOptional" && fieldDef._def?.typeName !== "ZodDefault") {
          required.push(key);
        }
      }
      return { type: "OBJECT", properties, required };
    }
    case "ZodRecord": {
      return { type: "OBJECT" };
    }
    default:
      return { type: "STRING" };
  }
}
