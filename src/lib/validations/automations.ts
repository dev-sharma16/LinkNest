import { z } from "zod";

// ============================================================
// Comment Automation
// ============================================================

export const keywordField = z
  .string()
  .min(1, "Keyword must be at least 1 character")
  .max(100, "Keyword must be at most 100 characters")
  .trim();

export const keywordsField = z
  .array(keywordField)
  .min(1, "Add at least one keyword")
  .max(20, "You can add up to 20 keywords");

export const externalUrlField = z
  .string()
  .min(1, "URL is required")
  .max(2048)
  .refine((u) => /^https?:\/\//i.test(u), {
    message: "URL must start with http:// or https://",
  });

export const automationStatusValues = [
  "draft",
  "active",
  "paused",
  "error",
  "disabled",
] as const;

export const automationStatusSchema = z.enum(automationStatusValues);

export const automationSchema = z.object({
  name: z.string().min(1, "Automation name is required").max(80),
  socialAccountId: z.string().uuid("Select an account"),
  keywords: keywordsField,
  replyMessage: z.string().min(1, "Reply message is required").max(1000),
  url: externalUrlField,
  cooldownMinutes: z.number().int().min(1).max(10080).optional(),
  status: automationStatusSchema.default("draft"),
});

export type AutomationValues = z.infer<typeof automationSchema>;

export const automationCreateSchema = z.object({
  name: z.string().min(1, "Automation name is required").max(80),
  socialAccountId: z.string().uuid("Select an account"),
  keywords: keywordsField,
  replyMessage: z.string().min(1, "Reply message is required").max(1000),
  url: externalUrlField,
  cooldownMinutes: z.number().int().min(1).max(10080).optional(),
});

export type AutomationCreateValues = z.infer<typeof automationCreateSchema>;

export const automationUpdateSchema = automationSchema.partial();

export type AutomationUpdateValues = z.infer<typeof automationUpdateSchema>;

// ============================================================
// Social accounts
// ============================================================

export const socialAccountConnectSchema = z.object({
  platform: z.enum(["instagram"]).default("instagram"),
  platformUserId: z.string().min(1, "Platform user id is required").max(255),
  username: z.string().min(1, "Username is required").max(255),
  displayName: z.string().max(255).optional().or(z.literal("")),
  accessToken: z.string().min(1, "Access token is required"),
  refreshToken: z.string().optional().or(z.literal("")),
  tokenExpiresAt: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .or(z.literal("")),
  scope: z.string().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  avatar: z.string().url().optional().or(z.literal("")),
});

export type SocialAccountConnectValues = z.infer<
  typeof socialAccountConnectSchema
>;

export const socialAccountOAuthSchema = z.object({
  code: z.string().min(1, "OAuth code is required"),
});

export type SocialAccountOAuthValues = z.infer<typeof socialAccountOAuthSchema>;