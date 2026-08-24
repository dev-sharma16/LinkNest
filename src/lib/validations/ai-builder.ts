import { z } from "zod";

// ============================================================
// AI Generation Input
// ============================================================

export const aiGenerateInputSchema = z.object({
  targetType: z.enum(["link_in_bio", "storefront"]),
  prompt: z
    .string()
    .min(10, "Please describe what you want in at least 10 characters")
    .max(5000, "Prompt is too long"),
  useCase: z
    .enum([
      "personal",
      "fitness",
      "gaming",
      "photography",
      "developer",
      "music",
      "business",
      "fashion",
      "beauty",
      "tech",
      "education",
      "other",
    ])
    .optional(),
  referenceUrls: z.array(z.string().url()).max(5).optional(),
  referenceImageUrls: z.array(z.string().url()).max(5).optional(),
  links: z
    .array(
      z.object({
        platform: z.string().optional(),
        url: z.string().url(),
      }),
    )
    .max(20)
    .optional(),
  existingPageId: z.string().uuid().optional(),
});

export type AIGenerateInput = z.infer<typeof aiGenerateInputSchema>;

// ============================================================
// AI Regeneration Input
// ============================================================

export const aiRegenerateInputSchema = z.object({
  targetType: z.enum(["link_in_bio", "storefront"]),
  prompt: z
    .string()
    .min(5, "Please describe the change you want")
    .max(2000),
  existingDesignSpec: z.record(z.string(), z.any()),
  existingPageId: z.string().uuid().optional(),
  operation: z
    .enum([
      "restyle",
      "reorder",
      "add_section",
      "remove_section",
      "change_theme",
      "improve_design",
      "modify_blocks",
      "full_regenerate",
    ])
    .optional(),
});

export type AIRegenerateInput = z.infer<typeof aiRegenerateInputSchema>;

// ============================================================
// Design Specification (AI output structure)
// ============================================================

export const aiThemeSpecSchema = z.object({
  themeName: z.enum(["light", "dark"]).optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  textColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  buttonBackground: z.string().optional(),
  buttonText: z.string().optional(),
  fontFamily: z.string().optional(),
  fontSize: z.string().optional(),
  fontWeight: z.string().optional(),
  backgroundType: z.enum(["solid", "gradient", "image"]).optional(),
  gradientFrom: z.string().optional(),
  gradientTo: z.string().optional(),
  backgroundImage: z.string().optional(),
  buttonStyle: z.enum(["solid", "outline", "ghost"]).optional(),
  buttonRadius: z.string().optional(),
  cardStyle: z.enum(["flat", "outlined", "shadow"]).optional(),
  blockSpacing: z.string().optional(),
  alignment: z.enum(["left", "center", "right"]).optional(),
});

export type AIThemeSpec = z.infer<typeof aiThemeSpecSchema>;

export const aiBlockSpecSchema = z.object({
  type: z.string(),
  config: z.record(z.string(), z.any()).optional(),
  order: z.number().int().min(0).optional(),
});

export type AIBlockSpec = z.infer<typeof aiBlockSpecSchema>;

export const aiProductSpecSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
  url: z.string().url(),
  ctaText: z.string().optional(),
  featured: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

export type AIProductSpec = z.infer<typeof aiProductSpecSchema>;

export const aiSocialLinkSpecSchema = z.object({
  platform: z.string(),
  url: z.string().url(),
});

export type AISocialLinkSpec = z.infer<typeof aiSocialLinkSpecSchema>;

export const aiDesignSpecificationSchema = z.object({
  target: z.enum(["link_in_bio", "storefront"]),
  profile: z
    .object({
      displayName: z.string().optional(),
      bio: z.string().optional(),
      avatar: z.string().optional(),
    })
    .optional(),
  theme: aiThemeSpecSchema.optional(),
  blocks: z.array(aiBlockSpecSchema).optional(),
  socialLinks: z.array(aiSocialLinkSpecSchema).optional(),
  storefront: z
    .object({
      name: z.string().optional(),
      description: z.string().optional(),
      sections: z
        .array(
          z.object({
            title: z.string(),
            products: z.array(aiProductSpecSchema),
          }),
        )
        .optional(),
      products: z.array(aiProductSpecSchema).optional(),
    })
    .optional(),
  layout: z
    .object({
      alignment: z.enum(["left", "center", "right"]).optional(),
      blockSpacing: z.string().optional(),
    })
    .optional(),
  metadata: z
    .object({
      suggestedName: z.string().optional(),
      suggestedDescription: z.string().optional(),
    })
    .optional(),
});

export type AIDesignSpecification = z.infer<typeof aiDesignSpecificationSchema>;

// ============================================================
// AI Generation Response
// ============================================================

export const aiGenerationResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "processing", "completed", "failed", "cancelled"]),
  designSpec: aiDesignSpecificationSchema.nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type AIGenerationResponse = z.infer<typeof aiGenerationResponseSchema>;
