import { z } from "zod";

const dateOrEmpty = z
  .string()
  .optional()
  .or(z.literal(""))
  .refine(
    (v) => v === undefined || v === "" || !isNaN(Date.parse(v)),
    { message: "Enter a valid date" },
  );

// ============================================================
// Profile
// ============================================================

export const profileSchema = z.object({
  username: z
    .string()
    .min(2, "Username must be at least 2 characters")
    .max(32, "Username must be at most 32 characters")
    .regex(
      /^[a-z0-9_-]+$/,
      "Username can only contain lowercase letters, numbers, dashes and underscores",
    ),
  displayName: z.string().min(1).max(64),
  bio: z.string().max(500).optional().or(z.literal("")),
  location: z.string().max(100).optional().or(z.literal("")),
  website: z.string().url("Enter a valid URL").max(500).optional().or(z.literal("")),
  avatar: z.string().url("Enter a valid image URL").max(1000).optional().or(z.literal("")),
  visibility: z.enum(["public", "private"]).default("public"),
  seoTitle: z.string().max(120).optional().or(z.literal("")),
  seoDescription: z.string().max(300).optional().or(z.literal("")),
  ogImage: z.string().url().max(1000).optional().or(z.literal("")),
});

export type ProfileValues = z.infer<typeof profileSchema>;

// ============================================================
// Social links
// ============================================================

export const SOCIAL_PLATFORMS = [
  "instagram",
  "twitter",
  "youtube",
  "tiktok",
  "linkedin",
  "facebook",
  "github",
  "twitch",
  "discord",
  "spotify",
  "pinterest",
  "snapchat",
  "threads",
  "custom",
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const socialLinkSchema = z.object({
  platform: z.enum(SOCIAL_PLATFORMS),
  url: z
    .string()
    .min(1, "URL is required")
    .max(2048)
    .refine((u) => /^https?:\/\//i.test(u), {
      message: "URL must start with http:// or https://",
    }),
});

export type SocialLinkValues = z.infer<typeof socialLinkSchema>;

export const socialLinksSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid().optional(),
      platform: z.enum(SOCIAL_PLATFORMS),
      url: z.string().min(1).max(2048),
    }),
  ),
});

// ============================================================
// Content blocks
// ============================================================

export const BLOCK_TYPES = [
  "button",
  "link",
  "text",
  "heading",
  "divider",
  "spacer",
  "image",
  "gallery",
  "video",
  "audio",
  "youtube",
  "spotify",
  "tiktok",
  "instagram",
  "twitter",
  "twitch",
  "vimeo",
  "maps",
  "custom_embed",
  "contact_form",
  "newsletter",
  "html",
  "file_download",
  "pdf_viewer",
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

export const blockConfigSchema = z.record(z.string(), z.any());

export const createBlockSchema = z.object({
  type: z.enum(BLOCK_TYPES),
  config: blockConfigSchema.optional(),
  order: z.number().int().min(0).optional(),
});

export type CreateBlockValues = z.infer<typeof createBlockSchema>;

export const updateBlockSchema = z.object({
  config: blockConfigSchema.optional(),
  hidden: z.boolean().optional(),
  scheduleStartAt: dateOrEmpty,
  scheduleEndAt: dateOrEmpty,
});

export type UpdateBlockValues = z.infer<typeof updateBlockSchema>;

export const reorderBlocksSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(500),
});

export const blockBulkSchema = z.object({
  action: z.enum(["duplicate", "hide", "unhide"]),
  ids: z.array(z.string().uuid()).min(1).max(500),
});

// ============================================================
// Theme / appearance
// ============================================================

export const themeStyleSchema = z.object({
  themeName: z.enum(["light", "dark"]).default("light"),
  preset: z.string().default("minimal"),
  primaryColor: z.string().default("#6366f1"),
  secondaryColor: z.string().default("#a855f7"),
  accentColor: z.string().default("#22d3ee"),
  textColor: z.string().default("#18181b"),
  backgroundColor: z.string().default("#ffffff"),
  buttonBackground: z.string().default("#18181b"),
  buttonText: z.string().default("#ffffff"),
  fontFamily: z.string().default("sans-serif"),
  fontSize: z.string().default("16px"),
  fontWeight: z.string().default("500"),
  backgroundType: z
    .enum(["solid", "gradient", "image"])
    .default("solid"),
  gradientFrom: z.string().default("#ffffff"),
  gradientTo: z.string().default("#f0f0ff"),
  backgroundImage: z.string().default("").or(z.literal("")).optional(),
  buttonStyle: z.enum(["solid", "outline", "ghost"]).default("solid"),
  buttonRadius: z.string().default("12px"),
  cardStyle: z.enum(["flat", "outlined", "shadow"]).default("shadow"),
  blockSpacing: z.string().default("12px"),
  alignment: z.enum(["left", "center", "right"]).default("center"),
  customCss: z.string().max(20000).optional().or(z.literal("")),
});

export type ThemeStyleValues = z.infer<typeof themeStyleSchema>;

// ============================================================
// Leads
// ============================================================

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  email: z.string().email("Enter a valid email").max(254),
  message: z.string().min(1, "Message is required").max(2000),
  token: z.string().optional(),
});

export type ContactValues = z.infer<typeof contactSchema>;

export const newsletterSchema = z.object({
  email: z.string().email("Enter a valid email").max(254),
  name: z.string().max(120).optional().or(z.literal("")),
  token: z.string().optional(),
});

export type NewsletterValues = z.infer<typeof newsletterSchema>;