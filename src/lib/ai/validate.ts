import type { z } from "zod";

const DANGEROUS_HTML_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /on\w+\s*=/gi,
  /javascript:/gi,
  /data:(?!image\/)/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^<]*\/?>/gi,
  /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi,
];

const SAFE_URL_PROTOCOLS = ["http:", "https:"];
const BLOCKED_HOSTNAMES = ["localhost", "127.0.0.1", "0.0.0.0", "::1"];

export function validateAIOutput<T>(
  schema: z.ZodType<T>,
  output: unknown,
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(output);
  if (!result.success) {
    const firstError = result.error.issues[0];
    const path = firstError?.path?.join(".") ?? "";
    const message = firstError?.message ?? "Invalid AI output";
    return { success: false, error: path ? `${path}: ${message}` : message };
  }
  return { success: true, data: result.data };
}

export function sanitizeHTML(input: string): string {
  let sanitized = input;
  for (const pattern of DANGEROUS_HTML_PATTERNS) {
    sanitized = sanitized.replace(pattern, "");
  }
  return sanitized
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .trim();
}

export function validateURL(url: string): { valid: boolean; error?: string } {
  if (!url || url.trim().length === 0) {
    return { valid: false, error: "URL is required" };
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }

  if (!SAFE_URL_PROTOCOLS.includes(parsed.protocol)) {
    return { valid: false, error: "URL must use http or https protocol" };
  }

  if (BLOCKED_HOSTNAMES.includes(parsed.hostname)) {
    return { valid: false, error: "URL hostname is not allowed" };
  }

  if (url.length > 2048) {
    return { valid: false, error: "URL is too long (max 2048 characters)" };
  }

  return { valid: true };
}

const EMBED_URL_PATTERNS: Record<string, RegExp[]> = {
  youtube: [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^https?:\/\/youtu\.be\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/,
  ],
  spotify: [
    /^https?:\/\/open\.spotify\.com\/(track|album|playlist|artist)\/[\w]+/,
  ],
  tiktok: [
    /^https?:\/\/(www\.)?tiktok\.com\/@[\w.]+\/video\/\d+/,
  ],
  instagram: [
    /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[\w-]+/,
  ],
  twitter: [
    /^https?:\/\/(www\.)?(twitter|x)\.com\/\w+\/status\/\d+/,
  ],
  twitch: [
    /^https?:\/\/(www\.)?twitch\.tv\/[\w]+/,
    /^https?:\/\/player\.twitch\.tv\/\?channel=[\w]+/,
  ],
  vimeo: [
    /^https?:\/\/(www\.)?vimeo\.com\/\d+/,
    /^https?:\/\/player\.vimeo\.com\/video\/\d+/,
  ],
  maps: [
    /^https?:\/\/(www\.)?google\.com\/maps/,
    /^https?:\/\/maps\.app\.goo\.gl\//,
  ],
};

export function validateEmbedURL(url: string): {
  valid: boolean;
  platform?: string;
  error?: string;
} {
  const urlValidation = validateURL(url);
  if (!urlValidation.valid) {
    return { valid: false, error: urlValidation.error };
  }

  for (const [platform, patterns] of Object.entries(EMBED_URL_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(url)) {
        return { valid: true, platform };
      }
    }
  }

  return { valid: true };
}

export function validateImageURL(url: string): { valid: boolean; error?: string } {
  const urlValidation = validateURL(url);
  if (!urlValidation.valid) {
    return { valid: false, error: urlValidation.error };
  }

  const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".avif"];
  const parsed = new URL(url);
  const pathname = parsed.pathname.toLowerCase();
  const hasImageExtension = IMAGE_EXTENSIONS.some((ext) => pathname.endsWith(ext));
  const isImageHost = /imagekit\.io|cloudinary\.com|imgur\.com/i.test(url);

  if (!hasImageExtension && !isImageHost && !url.includes("://")) {
    return { valid: false, error: "URL does not appear to be an image" };
  }

  return { valid: true };
}
