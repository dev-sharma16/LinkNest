import { z } from "zod";
import { BLOCK_TYPES } from "@/lib/validations/bio";

const blockConfigSchema = z.record(z.string(), z.unknown());

export const aiBioOutputSchema = z.object({
  profile: z.object({
    displayName: z.string().max(64).optional(),
    bio: z.string().max(500).optional(),
    avatar: z.string().url().max(1000).optional(),
    location: z.string().max(100).optional(),
    website: z.string().max(500).optional(),
  }).partial().optional(),
  socialLinks: z.array(
    z.object({
      platform: z.string(),
      url: z.string().url(),
    }),
  ).max(20).optional(),
  blocks: z.array(
    z.object({
      type: z.enum(BLOCK_TYPES),
      config: blockConfigSchema,
      order: z.number().int().min(0),
    }),
  ).max(100).optional(),
  theme: z.record(z.string(), z.unknown()).optional(),
});

export type AIBioOutput = z.infer<typeof aiBioOutputSchema>;

export const aiStorefrontOutputSchema = z.object({
  storefront: z.object({
    name: z.string().max(80).optional(),
    description: z.string().max(500).optional(),
    coverImage: z.string().url().max(1000).optional(),
    bannerImage: z.string().url().max(1000).optional(),
  }).partial().optional(),
  products: z.array(
    z.object({
      title: z.string().min(1).max(120),
      description: z.string().max(500).optional(),
      image: z.string().url().max(1000).optional(),
      url: z.string().url(),
      ctaText: z.string().max(40).optional(),
      featured: z.boolean().optional(),
    }),
  ).max(50).optional(),
  theme: z.record(z.string(), z.unknown()).optional(),
});

export type AIStorefrontOutput = z.infer<typeof aiStorefrontOutputSchema>;
