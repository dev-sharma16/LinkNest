import { z } from "zod";

export const TEMPLATE_TYPES = ["bio", "storefront"] as const;
export type TemplateType = (typeof TEMPLATE_TYPES)[number];

export const createTemplateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Template name is required")
    .max(60, "Template name must be at most 60 characters"),
  type: z.enum(TEMPLATE_TYPES),
  appearance: z.record(z.string(), z.any()),
});

export type CreateTemplateValues = z.infer<typeof createTemplateSchema>;

export const updateTemplateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Template name is required")
    .max(60, "Template name must be at most 60 characters")
    .optional(),
  appearance: z.record(z.string(), z.any()).optional(),
});

export type UpdateTemplateValues = z.infer<typeof updateTemplateSchema>;
