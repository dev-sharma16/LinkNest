import type { ThemeStyleValues } from "@/lib/validations/bio";
import type { StorefrontAppearanceValues } from "@/lib/validations/storefront";
import type { BlockType } from "@/lib/validations/bio";
import { DEFAULT_THEME } from "@/lib/bio-themes";
import { STOREFRONT_DEFAULT_THEME } from "@/lib/storefront-themes";
import { normalizeBlockConfig } from "@/lib/bio-blocks";

export type DesignComponent = {
  type: BlockType;
  config: Record<string, unknown>;
  order: number;
  hidden: boolean;
};

export type DesignSpecification = {
  metadata: {
    version: string;
    createdAt: string;
    targetType: "bio" | "storefront";
  };
  theme: ThemeStyleValues;
  typography: {
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
  };
  background: {
    type: "solid" | "gradient" | "image";
    colors: { from: string; to: string };
    image: string;
  };
  layout: {
    type: string;
    spacing: string;
    maxWidth: string;
    alignment: string;
  };
  components: DesignComponent[];
  settings: {
    visibility: "public" | "private";
    published: boolean;
  };
};

export function createBioDesignSpec(input: {
  theme?: Partial<ThemeStyleValues>;
  components?: DesignComponent[];
  settings?: { visibility?: "public" | "private"; published?: boolean };
}): DesignSpecification {
  const theme = { ...DEFAULT_THEME, ...input.theme };

  return {
    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
      targetType: "bio",
    },
    theme,
    typography: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize,
      fontWeight: theme.fontWeight,
    },
    background: {
      type: theme.backgroundType,
      colors: { from: theme.gradientFrom, to: theme.gradientTo },
      image: theme.backgroundImage ?? "",
    },
    layout: {
      type: "single",
      spacing: theme.blockSpacing,
      maxWidth: "640px",
      alignment: theme.alignment,
    },
    components: input.components ?? [],
    settings: {
      visibility: input.settings?.visibility ?? "public",
      published: input.settings?.published ?? false,
    },
  };
}

export function createStorefrontDesignSpec(input: {
  theme?: Partial<StorefrontAppearanceValues>;
  components?: DesignComponent[];
  settings?: { visibility?: "public" | "private"; published?: boolean };
}): DesignSpecification {
  const theme = { ...STOREFRONT_DEFAULT_THEME, ...input.theme };

  return {
    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
      targetType: "storefront",
    },
    theme: theme as unknown as ThemeStyleValues,
    typography: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize,
      fontWeight: theme.fontWeight,
    },
    background: {
      type: theme.backgroundType,
      colors: { from: theme.gradientFrom, to: theme.gradientTo },
      image: theme.backgroundImage ?? "",
    },
    layout: {
      type: theme.layout ?? "grid",
      spacing: theme.productSpacing ?? "16px",
      maxWidth: "1200px",
      alignment: theme.alignment,
    },
    components: input.components ?? [],
    settings: {
      visibility: input.settings?.visibility ?? "public",
      published: input.settings?.published ?? false,
    },
  };
}

export function mergeDesignSpecs(
  base: DesignSpecification,
  override: Partial<DesignSpecification>,
): DesignSpecification {
  return {
    ...base,
    ...override,
    metadata: { ...base.metadata, ...override.metadata },
    theme: { ...base.theme, ...override.theme } as ThemeStyleValues,
    typography: { ...base.typography, ...override.typography },
    background: { ...base.background, ...override.background },
    layout: { ...base.layout, ...override.layout },
    components: override.components ?? base.components,
    settings: { ...base.settings, ...override.settings },
  };
}

export function designSpecToBioBlocks(
  spec: DesignSpecification,
): Array<{ type: BlockType; config: Record<string, unknown>; order: number; hidden: boolean }> {
  return spec.components.map((comp) => ({
    type: comp.type,
    config: normalizeBlockConfig(comp.type, comp.config),
    order: comp.order,
    hidden: comp.hidden,
  }));
}

export function designSpecToStorefrontData(spec: DesignSpecification): {
  appearance: Partial<StorefrontAppearanceValues>;
  products: Array<{ title: string; description?: string; image?: string; url: string; ctaText?: string; featured?: boolean; order: number }>;
} {
  const appearance: Partial<StorefrontAppearanceValues> = {
    ...(spec.theme as unknown as Partial<StorefrontAppearanceValues>),
    layout: (spec.layout.type as "grid" | "list") ?? "grid",
    productSpacing: spec.layout.spacing,
  };

  const products = spec.components
    .filter((c) => c.type === "storefront")
    .map((c, i) => ({
      title: (c.config.title as string) ?? "Product",
      description: c.config.description as string | undefined,
      image: c.config.image as string | undefined,
      url: (c.config.url as string) ?? "https://",
      ctaText: c.config.ctaText as string | undefined,
      featured: (c.config.featured as boolean) ?? false,
      order: c.order ?? i,
    }));

  return { appearance, products };
}

export function bioToDesignSpec(
  profile: {
    displayName?: string;
    bio?: string;
    avatar?: string;
    location?: string;
    website?: string;
    appearance?: unknown;
  },
  blocks: Array<{ type: string; config?: unknown; order: number; hidden: boolean }>,
): DesignSpecification {
  const theme = (profile.appearance as Partial<ThemeStyleValues>) ?? {};

  return createBioDesignSpec({
    theme,
    components: blocks.map((b) => ({
      type: b.type as BlockType,
      config: (b.config as Record<string, unknown>) ?? {},
      order: b.order,
      hidden: b.hidden,
    })),
  });
}

export function storefrontToDesignSpec(
  storefront: {
    name?: string;
    description?: string;
    coverImage?: string;
    bannerImage?: string;
    appearance?: unknown;
  },
  products: Array<{ title: string; description?: string; image?: string; url: string; ctaText?: string; featured?: boolean; order: number }>,
): DesignSpecification {
  const theme = (storefront.appearance as Partial<StorefrontAppearanceValues>) ?? {};

  return createStorefrontDesignSpec({
    theme,
    components: products.map((p, i) => ({
      type: "storefront" as BlockType,
      config: {
        title: p.title,
        description: p.description,
        image: p.image,
        url: p.url,
        ctaText: p.ctaText,
        featured: p.featured,
      },
      order: p.order ?? i,
      hidden: false,
    })),
  });
}
