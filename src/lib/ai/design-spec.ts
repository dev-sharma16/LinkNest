import type { ThemeStyleValues } from "@/lib/validations/bio";
import { DEFAULT_THEME } from "@/lib/bio-themes";
import { BLOCK_META } from "@/lib/bio-blocks";
import type { BlockType } from "@/lib/validations/bio";
import type {
  AIDesignSpecification,
  AIThemeSpec,
  AIBlockSpec,
} from "@/lib/validations/ai-builder";

// ============================================================
// Color validation
// ============================================================

const HEX_COLOR_RE = /^#[0-9a-fA-F]{3,8}$/;

function isValidHex(color: string | undefined): boolean {
  return !!color && HEX_COLOR_RE.test(color);
}

function safeHex(color: string | undefined, fallback: string): string {
  return isValidHex(color) ? color! : fallback;
}

// ============================================================
// Theme normalization
// ============================================================

export function normalizeTheme(
  aiTheme: AIThemeSpec | undefined,
): Partial<ThemeStyleValues> {
  if (!aiTheme) return {};

  return {
    themeName: aiTheme.themeName ?? DEFAULT_THEME.themeName,
    primaryColor: safeHex(aiTheme.primaryColor, DEFAULT_THEME.primaryColor),
    secondaryColor: safeHex(aiTheme.secondaryColor, DEFAULT_THEME.secondaryColor),
    accentColor: safeHex(aiTheme.accentColor, DEFAULT_THEME.accentColor),
    textColor: safeHex(aiTheme.textColor, DEFAULT_THEME.textColor),
    backgroundColor: safeHex(aiTheme.backgroundColor, DEFAULT_THEME.backgroundColor),
    buttonBackground: safeHex(aiTheme.buttonBackground, DEFAULT_THEME.buttonBackground),
    buttonText: safeHex(aiTheme.buttonText, DEFAULT_THEME.buttonText),
    fontFamily: aiTheme.fontFamily || DEFAULT_THEME.fontFamily,
    fontSize: aiTheme.fontSize || DEFAULT_THEME.fontSize,
    fontWeight: aiTheme.fontWeight || DEFAULT_THEME.fontWeight,
    backgroundType: aiTheme.backgroundType ?? DEFAULT_THEME.backgroundType,
    gradientFrom: safeHex(aiTheme.gradientFrom, DEFAULT_THEME.gradientFrom),
    gradientTo: safeHex(aiTheme.gradientTo, DEFAULT_THEME.gradientTo),
    backgroundImage: aiTheme.backgroundImage ?? DEFAULT_THEME.backgroundImage,
    buttonStyle: aiTheme.buttonStyle ?? DEFAULT_THEME.buttonStyle,
    buttonRadius: aiTheme.buttonRadius || DEFAULT_THEME.buttonRadius,
    cardStyle: aiTheme.cardStyle ?? DEFAULT_THEME.cardStyle,
    blockSpacing: aiTheme.blockSpacing || DEFAULT_THEME.blockSpacing,
    alignment: aiTheme.alignment ?? DEFAULT_THEME.alignment,
  };
}

// ============================================================
// Block normalization
// ============================================================

const VALID_BLOCK_TYPES = new Set(Object.keys(BLOCK_META));

function normalizeBlock(block: AIBlockSpec, index: number): {
  type: BlockType;
  config: Record<string, unknown>;
  order: number;
} | null {
  if (!block.type || !VALID_BLOCK_TYPES.has(block.type)) {
    return null;
  }

  const type = block.type as BlockType;
  const defaults = BLOCK_META[type].defaults;
  const config = { ...defaults, ...(block.config ?? {}) };

  return {
    type,
    config,
    order: block.order ?? index,
  };
}

export function normalizeBlocks(
  aiBlocks: AIBlockSpec[] | undefined,
): Array<{ type: BlockType; config: Record<string, unknown>; order: number }> {
  if (!aiBlocks?.length) return [];

  return aiBlocks
    .map((block, index) => normalizeBlock(block, index))
    .filter((b): b is NonNullable<typeof b> => b !== null)
    .sort((a, b) => a.order - b.order);
}

// ============================================================
// Social links normalization
// ============================================================

const VALID_PLATFORMS = new Set([
  "instagram", "twitter", "youtube", "tiktok", "linkedin", "facebook",
  "github", "twitch", "discord", "spotify", "pinterest", "snapchat",
  "threads", "custom",
]);

function normalizePlatform(platform: string): string {
  const lower = platform.toLowerCase().trim();
  if (VALID_PLATFORMS.has(lower)) return lower;
  if (lower.includes("instagram") || lower.includes("insta")) return "instagram";
  if (lower.includes("twitter") || lower.includes("x.com")) return "twitter";
  if (lower.includes("youtube")) return "youtube";
  if (lower.includes("tiktok")) return "tiktok";
  if (lower.includes("linkedin")) return "linkedin";
  if (lower.includes("facebook")) return "facebook";
  if (lower.includes("github")) return "github";
  if (lower.includes("twitch")) return "twitch";
  if (lower.includes("discord")) return "discord";
  if (lower.includes("spotify")) return "spotify";
  if (lower.includes("pinterest")) return "pinterest";
  if (lower.includes("snapchat")) return "snapchat";
  if (lower.includes("threads")) return "threads";
  return "custom";
}

export function normalizeSocialLinks(
  aiLinks: Array<{ platform: string; url: string }> | undefined,
): Array<{ platform: string; url: string }> {
  if (!aiLinks?.length) return [];

  return aiLinks
    .filter((link) => {
      try {
        new URL(link.url);
        return true;
      } catch {
        return false;
      }
    })
    .map((link) => ({
      platform: normalizePlatform(link.platform),
      url: link.url,
    }));
}

// ============================================================
// Product normalization
// ============================================================

export function normalizeProducts(
  aiProducts: Array<Record<string, unknown>> | undefined,
): Array<{
  title: string;
  description: string;
  image: string;
  url: string;
  ctaText: string;
  featured: boolean;
  order: number;
}> {
  if (!aiProducts?.length) return [];

  return aiProducts
    .filter((p) => p.title && p.url)
    .map((p, index) => ({
      title: String(p.title),
      description: String(p.description ?? ""),
      image: String(p.image ?? ""),
      url: String(p.url),
      ctaText: String(p.ctaText ?? "View Product"),
      featured: Boolean(p.featured),
      order: typeof p.order === "number" ? p.order : index,
    }));
}

// ============================================================
// Full design specification normalization
// ============================================================

export function normalizeDesignSpec(
  raw: AIDesignSpecification,
): AIDesignSpecification {
  return {
    target: raw.target,
    profile: raw.profile ?? undefined,
    theme: raw.theme ?? undefined,
    blocks: normalizeBlocks(raw.blocks).map((b) => ({
      type: b.type,
      config: b.config,
      order: b.order,
    })),
    socialLinks: normalizeSocialLinks(raw.socialLinks),
    storefront: raw.storefront
      ? {
          name: raw.storefront.name,
          description: raw.storefront.description,
          products: normalizeProducts(
            raw.storefront.products as Array<Record<string, unknown>> | undefined,
          ),
          sections: raw.storefront.sections?.map((s) => ({
            title: s.title,
            products: normalizeProducts(
              s.products as Array<Record<string, unknown>> | undefined,
            ),
          })),
        }
      : undefined,
    layout: raw.layout,
    metadata: raw.metadata,
  };
}

// ============================================================
// Validation
// ============================================================

export function validateDesignSpec(
  spec: AIDesignSpecification,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!spec.target) {
    errors.push("Missing target type");
  }

  if (spec.target === "link_in_bio") {
    if (spec.blocks?.length) {
      spec.blocks.forEach((block, i) => {
        if (!VALID_BLOCK_TYPES.has(block.type)) {
          errors.push(`Block ${i}: unsupported type "${block.type}"`);
        }
      });
    }
  }

  if (spec.theme) {
    const t = spec.theme;
    if (t.primaryColor && !isValidHex(t.primaryColor)) {
      errors.push(`Invalid primaryColor: ${t.primaryColor}`);
    }
    if (t.textColor && !isValidHex(t.textColor)) {
      errors.push(`Invalid textColor: ${t.textColor}`);
    }
    if (t.backgroundColor && !isValidHex(t.backgroundColor)) {
      errors.push(`Invalid backgroundColor: ${t.backgroundColor}`);
    }
  }

  if (spec.socialLinks?.length) {
    spec.socialLinks.forEach((link, i) => {
      try {
        new URL(link.url);
      } catch {
        errors.push(`Social link ${i}: invalid URL "${link.url}"`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}
