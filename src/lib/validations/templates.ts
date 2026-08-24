import { z } from "zod";

export const TEMPLATE_TYPES = ["bio", "storefront"] as const;
export type TemplateType = (typeof TEMPLATE_TYPES)[number];

export const TEMPLATE_SOURCES = ["manual", "ai"] as const;
export type TemplateSource = (typeof TEMPLATE_SOURCES)[number];

export const TEMPLATE_COMPATIBILITY = ["link_in_bio", "storefront", "both"] as const;
export type TemplateCompatibility = (typeof TEMPLATE_COMPATIBILITY)[number];

export const createTemplateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Template name is required")
    .max(60, "Template name must be at most 60 characters"),
  description: z.string().max(200).optional().or(z.literal("")),
  type: z.enum(TEMPLATE_TYPES),
  source: z.enum(TEMPLATE_SOURCES).default("manual"),
  compatibility: z.enum(TEMPLATE_COMPATIBILITY).default("both"),
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
  description: z.string().max(200).optional().or(z.literal("")),
  source: z.enum(TEMPLATE_SOURCES).optional(),
  compatibility: z.enum(TEMPLATE_COMPATIBILITY).optional(),
  appearance: z.record(z.string(), z.any()).optional(),
});

export type UpdateTemplateValues = z.infer<typeof updateTemplateSchema>;
