import { z } from "zod";

export const generateBioSchema = z.object({
  prompt: z
    .string()
    .min(10, "Prompt must be at least 10 characters")
    .max(2000, "Prompt must be at most 2000 characters"),
  useCase: z.string().max(200).optional().or(z.literal("")),
  referenceURLs: z.array(z.string().url()).max(5).optional(),
  referenceImages: z.array(z.string().url()).max(5).optional(),
});

export type GenerateBioValues = z.infer<typeof generateBioSchema>;

export const generateStorefrontSchema = z.object({
  prompt: z
    .string()
    .min(10, "Prompt must be at least 10 characters")
    .max(2000, "Prompt must be at most 2000 characters"),
  useCase: z.string().max(200).optional().or(z.literal("")),
  referenceURLs: z.array(z.string().url()).max(5).optional(),
  referenceImages: z.array(z.string().url()).max(5).optional(),
});

export type GenerateStorefrontValues = z.infer<typeof generateStorefrontSchema>;

export const applyGenerationSchema = z.object({
  generationId: z.string().uuid("Invalid generation ID"),
  targetType: z.enum(["bio", "storefront"]),
});

export type ApplyGenerationValues = z.infer<typeof applyGenerationSchema>;

export const generationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  targetType: z.enum(["bio", "storefront"]).optional(),
  status: z.enum(["pending", "processing", "completed", "failed", "cancelled"]).optional(),
});

export type GenerationQueryValues = z.infer<typeof generationQuerySchema>;
