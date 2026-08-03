import { z } from "zod";

const dateField = z
  .string()
  .optional()
  .or(z.literal(""))
  .refine(
    (v) => v === undefined || v === "" || !isNaN(Date.parse(v)),
    { message: "Enter a valid date" },
  );

export const createLinkSchema = z.object({
  destination: z
    .string()
    .url("Enter a valid URL (include https://)")
    .max(2048, "URL is too long")
    .refine((url) => url.startsWith("http://") || url.startsWith("https://"), {
      message: "URL must start with http:// or https://",
    }),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(64, "Slug must be at most 64 characters")
    .regex(
      /^[a-z0-9-_]+$/i,
      "Slug can only contain letters, numbers, dashes and underscores",
    )
    .optional()
    .or(z.literal("")),
  title: z.string().max(120).optional().or(z.literal("")),
  description: z.string().max(500).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
  folderId: z.string().uuid().optional().or(z.literal("")).or(z.literal("__none__")),
  tagIds: z.array(z.string().uuid()).optional(),
  password: z.string().max(128).optional().or(z.literal("")),
  expiresAt: dateField,
  activateAt: dateField,
  utmSource: z.string().max(100).optional().or(z.literal("")),
  utmMedium: z.string().max(100).optional().or(z.literal("")),
  utmCampaign: z.string().max(100).optional().or(z.literal("")),
  utmTerm: z.string().max(100).optional().or(z.literal("")),
  utmContent: z.string().max(100).optional().or(z.literal("")),
  iosDeepLink: z.string().max(2048).optional().or(z.literal("")),
  androidDeepLink: z.string().max(2048).optional().or(z.literal("")),
});

export type CreateLinkValues = z.infer<typeof createLinkSchema>;

export const createFolderSchema = z.object({
  name: z
    .string()
    .min(1, "Folder name is required")
    .max(64, "Folder name must be at most 64 characters"),
});

export type CreateFolderValues = z.infer<typeof createFolderSchema>;

export const createTagSchema = z.object({
  name: z
    .string()
    .min(1, "Tag name is required")
    .max(32, "Tag name must be at most 32 characters"),
});

export type CreateTagValues = z.infer<typeof createTagSchema>;

export const createUtmTemplateSchema = z.object({
  name: z
    .string()
    .min(1, "Template name is required")
    .max(64, "Template name must be at most 64 characters"),
  source: z.string().max(100).optional().or(z.literal("")),
  medium: z.string().max(100).optional().or(z.literal("")),
  campaign: z.string().max(100).optional().or(z.literal("")),
  term: z.string().max(100).optional().or(z.literal("")),
  content: z.string().max(100).optional().or(z.literal("")),
});

export type CreateUtmTemplateValues = z.infer<typeof createUtmTemplateSchema>;

export const createDomainSchema = z.object({
  domain: z
    .string()
    .min(3, "Domain is required")
    .max(253, "Domain is too long")
    .regex(
      /^(?!-)(?:[a-zA-Z\d-]{1,63}\.)+[a-zA-Z]{2,63}$/,
      "Enter a valid domain (e.g. links.example.com)",
    ),
});

export type CreateDomainValues = z.infer<typeof createDomainSchema>;
