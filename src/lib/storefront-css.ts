import type { CSSProperties } from "react";
import { backgroundStyle } from "@/lib/bio-css";
import type { StorefrontAppearanceValues } from "@/lib/validations/storefront";
import { STOREFRONT_DEFAULT_THEME, mergeStorefrontAppearance } from "@/lib/storefront-themes";

export function toStorefrontTheme(
  appearance: Record<string, unknown> | null | undefined,
): StorefrontAppearanceValues {
  return mergeStorefrontAppearance(
    STOREFRONT_DEFAULT_THEME,
    (appearance ?? {}) as Partial<StorefrontAppearanceValues>,
  );
}

export function storefrontVars(theme: StorefrontAppearanceValues): CSSProperties {
  return {
    "--sf-primary": theme.primaryColor,
    "--sf-secondary": theme.secondaryColor,
    "--sf-accent": theme.accentColor,
    "--sf-text": theme.textColor,
    "--sf-btn-bg": theme.buttonBackground,
    "--sf-btn-text": theme.buttonText,
    "--sf-btn-radius": theme.buttonRadius,
    "--sf-card-radius": theme.cardRadius,
    "--sf-spacing": theme.productSpacing,
    "--sf-font-size": theme.fontSize,
    "--sf-font-weight": theme.fontWeight,
    "--sf-align": theme.alignment,
    fontFamily: theme.fontFamily,
    ...backgroundStyle(theme),
  } as CSSProperties;
}
