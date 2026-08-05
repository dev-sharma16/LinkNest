import { z } from "zod";
import { themeStyleSchema } from "@/lib/validations/bio";

// ============================================================
// Storefront
// ============================================================

export const slugField = z
  .string()
  .min(2, "Slug must be at least 2 characters")
  .max(40, "Slug must be at most 40 characters")
  .regex(
    /^[a-z0-9-]+$/,
    "Slug can only contain lowercase letters, numbers and dashes",
  );

export const storefrontSchema = z.object({
  name: z.string().min(1, "Storefront name is required").max(80),
  slug: slugField,
  description: z.string().max(500).optional().or(z.literal("")),
  coverImage: z.string().url("Enter a valid image URL").max(1000).optional().or(z.literal("")),
  bannerImage: z.string().url("Enter a valid image URL").max(1000).optional().or(z.literal("")),
  visibility: z.enum(["public", "private"]).default("public"),
  seoTitle: z.string().max(120).optional().or(z.literal("")),
  seoDescription: z.string().max(300).optional().or(z.literal("")),
  ogImage: z.string().url().max(1000).optional().or(z.literal("")),
});

export const storefrontCreateSchema = z.object({
  name: z.string().min(1, "Storefront name is required").max(80),
  slug: slugField.optional().or(z.literal("")),
  description: z.string().max(500).optional().or(z.literal("")),
  coverImage: z.string().url("Enter a valid image URL").max(1000).optional().or(z.literal("")),
  bannerImage: z.string().url("Enter a valid image URL").max(1000).optional().or(z.literal("")),
  visibility: z.enum(["public", "private"]).default("public"),
  seoTitle: z.string().max(120).optional().or(z.literal("")),
  seoDescription: z.string().max(300).optional().or(z.literal("")),
  ogImage: z.string().url().max(1000).optional().or(z.literal("")),
});

export type StorefrontValues = z.infer<typeof storefrontSchema>;

// ============================================================
// Product cards
// ============================================================

export const productUrlField = z
  .string()
  .min(1, "Product URL is required")
  .max(2048)
  .refine((u) => /^https?:\/\//i.test(u), {
    message: "URL must start with http:// or https://",
  });

export const productCardSchema = z.object({
  title: z.string().min(1, "Product title is required").max(120),
  description: z.string().max(500).optional().or(z.literal("")),
  image: z.string().url("Enter a valid image URL").max(1000).optional().or(z.literal("")),
  url: productUrlField,
  ctaText: z.string().max(40).optional().or(z.literal("")),
  featured: z.boolean().default(false),
  order: z.number().int().min(0).optional(),
});

export type ProductCardValues = z.infer<typeof productCardSchema>;

export const updateProductSchema = productCardSchema.partial();

export const reorderProductsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(500),
});

export const productBulkSchema = z.object({
  action: z.enum(["delete", "feature", "unfeature"]),
  ids: z.array(z.string().uuid()).min(1).max(500),
});

// ============================================================
// Storefront appearance (extends bio theme with storefront layout)
// ============================================================

export const storefrontAppearanceSchema = themeStyleSchema
  .extend({
    layout: z.enum(["grid", "list"]).default("grid"),
    cardRadius: z.string().default("16px"),
    cardShadow: z.enum(["none", "sm", "md", "lg"]).default("md"),
    productSpacing: z.string().default("16px"),
  })
  .optional();

export type StorefrontAppearanceValues = z.infer<typeof themeStyleSchema> & {
  layout: "grid" | "list";
  cardRadius: string;
  cardShadow: "none" | "sm" | "md" | "lg";
  productSpacing: string;
};

// ============================================================
// Storefront events
// ============================================================

export const storefrontEventSchema = z.object({
  eventType: z.enum(["view", "click"]),
  productId: z.string().uuid().optional(),
});
