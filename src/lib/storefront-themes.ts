import { DEFAULT_THEME, THEME_PRESETS } from "@/lib/bio-themes";
import type { StorefrontAppearanceValues } from "@/lib/validations/storefront";

export const STOREFRONT_DEFAULT_THEME: StorefrontAppearanceValues = {
  ...DEFAULT_THEME,
  layout: "grid",
  cardRadius: "16px",
  cardShadow: "md",
  productSpacing: "16px",
};

/**
 * Storefront presets reuse the bio theme presets for colors/typography and
 * layer the storefront-specific layout defaults on top.
 */
export const STOREFRONT_PRESETS = THEME_PRESETS.map((preset) => ({
  ...preset,
  style: {
    ...preset.style,
    layout: "grid" as const,
    cardRadius: "16px",
    cardShadow: "md" as const,
    productSpacing: "16px",
  },
}));

export function mergeStorefrontAppearance(
  base: StorefrontAppearanceValues,
  partial: Partial<StorefrontAppearanceValues>,
): StorefrontAppearanceValues {
  return { ...STOREFRONT_DEFAULT_THEME, ...base, ...partial };
}
