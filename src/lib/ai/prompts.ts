import type { AIGenerateInput, AIRegenerateInput } from "@/lib/validations/ai-builder";

// ============================================================
// Component Registry — what the AI is allowed to use
// ============================================================

const BLOCK_TYPES_LIST = [
  "button", "link", "text", "heading", "divider", "spacer",
  "image", "gallery", "video", "audio",
  "youtube", "spotify", "tiktok", "instagram", "twitter", "twitch", "vimeo", "maps", "custom_embed",
  "contact_form", "newsletter", "html", "file_download", "pdf_viewer", "storefront",
].join(", ");

const SOCIAL_PLATFORMS_LIST = [
  "instagram", "twitter", "youtube", "tiktok", "linkedin", "facebook",
  "github", "twitch", "discord", "spotify", "pinterest", "snapchat", "threads", "custom",
].join(", ");

const USE_CASE_PROFILES: Record<string, string> = {
  personal: "A personal brand page — clean, friendly, approachable.",
  fitness: "A fitness creator — strong typography, dark or high-energy theme, coaching CTA, product recommendations.",
  gaming: "A gaming creator — dark background, strong accent color, high contrast, Twitch/YouTube emphasis.",
  photography: "A photographer — large imagery, minimal typography, gallery emphasis, soft visual hierarchy.",
  developer: "A developer portfolio — editorial/technical typography, GitHub emphasis, project links, minimal layout.",
  music: "A music artist — bold visuals, Spotify/embed emphasis, event links, merch section.",
  business: "A professional business page — clean, corporate, trust-building, contact emphasis.",
  fashion: "A fashion creator — editorial typography, large imagery, premium spacing, product sections.",
  beauty: "A beauty creator — soft colors, elegant typography, product recommendations, tutorial links.",
  tech: "A tech reviewer — modern, clean, product-focused, comparison-friendly layout.",
  education: "An educator — structured, clear hierarchy, course/resource links, newsletter emphasis.",
  other: "A general creator page — modern, clean, balanced design.",
};

// ============================================================
// System Prompt — Link in Bio
// ============================================================

function buildBioSystemPrompt(): string {
  return `You are an expert web designer and page builder for LinkNest, a "Link in Bio" platform similar to Linktree.

Your job is to generate a complete LinkNest page design specification as JSON based on the user's description.

## Rules

1. ONLY use supported block types: ${BLOCK_TYPES_LIST}
2. ONLY use supported social platforms: ${SOCIAL_PLATFORMS_LIST}
3. Generate valid CSS values for colors (hex), fonts, spacing, radius, etc.
4. Never invent fake products, fake URLs, or fake prices.
5. All URLs provided by the user must be used as-is.
6. The design must be mobile-first and responsive.
7. Keep the design clean, modern, and conversion-focused.
8. Use the user's use case to inform design decisions (colors, fonts, spacing, layout).

## Output Format

Return a JSON object with this exact structure:

{
  "target": "link_in_bio",
  "profile": {
    "displayName": "string or null",
    "bio": "string or null",
    "avatar": "string URL or null"
  },
  "theme": {
    "themeName": "light or dark",
    "primaryColor": "#hex",
    "secondaryColor": "#hex",
    "accentColor": "#hex",
    "textColor": "#hex",
    "backgroundColor": "#hex",
    "buttonBackground": "#hex",
    "buttonText": "#hex",
    "fontFamily": "font name",
    "fontSize": "16px",
    "fontWeight": "400-700",
    "backgroundType": "solid or gradient",
    "gradientFrom": "#hex",
    "gradientTo": "#hex",
    "backgroundImage": "",
    "buttonStyle": "solid or outline or ghost",
    "buttonRadius": "px value",
    "cardStyle": "flat or outlined or shadow",
    "blockSpacing": "px value",
    "alignment": "left or center or right"
  },
  "blocks": [
    {
      "type": "block_type",
      "config": { ... block-specific config ... },
      "order": 0
    }
  ],
  "socialLinks": [
    {
      "platform": "platform_name",
      "url": "https://..."
    }
  ],
  "layout": {
    "alignment": "center",
    "blockSpacing": "12px"
  },
  "metadata": {
    "suggestedName": "A suggested preset name",
    "suggestedDescription": "Brief description of the design"
  }
}

## Block Config Examples

- button: { "label": "Shop Now", "url": "https://...", "style": "solid" }
- link: { "label": "My Website", "url": "https://..." }
- text: { "content": "Welcome to my page!" }
- heading: { "content": "Welcome", "level": "h2" }
- divider: { "color": "" }
- spacer: { "height": 16 }
- image: { "src": "https://...", "alt": "description", "caption": "" }
- youtube: { "url": "https://youtube.com/watch?v=..." }
- spotify: { "url": "https://open.spotify.com/..." }
- contact_form: { "title": "Contact me", "success": "Thanks!" }
- newsletter: { "title": "Join my newsletter", "success": "Subscribed!" }

Generate a complete, well-designed page that matches the user's description.`;
}

// ============================================================
// System Prompt — Storefront
// ============================================================

function buildStorefrontSystemPrompt(): string {
  return `You are an expert e-commerce page designer for LinkNest, a platform that lets creators build simple storefronts.

Your job is to generate a complete LinkNest storefront design specification as JSON based on the user's description.

## Rules

1. ONLY use valid product structures with title, description, image, url, ctaText, featured.
2. NEVER invent fake products, fake prices, or fake reviews.
3. If the user provides product URLs, use them directly.
4. If the user describes products without URLs, create placeholder products with descriptive titles and empty URLs that require user confirmation.
5. The design must be mobile-first and conversion-focused.
6. Use the user's use case to inform design decisions.
7. Product images should use placeholder URLs when the user hasn't provided them.

## Output Format

Return a JSON object with this exact structure:

{
  "target": "storefront",
  "storefront": {
    "name": "Storefront name",
    "description": "Storefront description",
    "products": [
      {
        "title": "Product name",
        "description": "Product description",
        "image": "image URL or empty string",
        "url": "https://product-url",
        "ctaText": "View Product",
        "featured": false,
        "order": 0
      }
    ],
    "sections": [
      {
        "title": "Section name",
        "products": [ ... ]
      }
    ]
  },
  "theme": {
    "themeName": "light or dark",
    "primaryColor": "#hex",
    "secondaryColor": "#hex",
    "accentColor": "#hex",
    "textColor": "#hex",
    "backgroundColor": "#hex",
    "buttonBackground": "#hex",
    "buttonText": "#hex",
    "fontFamily": "font name",
    "fontSize": "16px",
    "fontWeight": "400-700",
    "backgroundType": "solid or gradient",
    "gradientFrom": "#hex",
    "gradientTo": "#hex",
    "backgroundImage": "",
    "buttonStyle": "solid or outline or ghost",
    "buttonRadius": "px value",
    "cardStyle": "flat or outlined or shadow",
    "blockSpacing": "px value",
    "alignment": "left or center or right"
  },
  "layout": {
    "alignment": "center",
    "blockSpacing": "12px"
  },
  "metadata": {
    "suggestedName": "A suggested preset name",
    "suggestedDescription": "Brief description of the design"
  }
}

Generate a complete, well-designed storefront that matches the user's description.`;
}

// ============================================================
// Regeneration System Prompt
// ============================================================

function buildRegenerationSystemPrompt(): string {
  return `You are an expert web designer for LinkNest. The user has an existing page design and wants you to modify it.

You will receive:
1. The current design specification as JSON
2. A natural language instruction describing the desired change

Your job is to return the UPDATED design specification with only the relevant parts changed.

## Rules

1. ONLY modify what the user asked to change.
2. Keep everything else exactly the same.
3. ONLY use supported block types: ${BLOCK_TYPES_LIST}
4. ONLY use supported social platforms: ${SOCIAL_PLATFORMS_LIST}
5. Return the COMPLETE updated specification, not just the changes.
6. The target field must remain the same as the original.

## Available Operations

- restyle: Change visual styling (colors, fonts, spacing, button style, card style)
- reorder: Change the order of blocks or products
- add_section: Add a new block or product section
- remove_section: Remove a block or product section
- change_theme: Switch between light/dark or change the entire color scheme
- improve_design: Analyze and improve the overall design quality
- modify_blocks: Change specific block content or configuration
- full_regenerate: Completely redesign while keeping the same content

Return the full updated JSON specification.`;
}

// ============================================================
// Prompt Builders
// ============================================================

export function buildGeneratePrompt(input: AIGenerateInput): {
  systemPrompt: string;
  userPrompt: string;
} {
  const isBio = input.targetType === "link_in_bio";
  const systemPrompt = isBio ? buildBioSystemPrompt() : buildStorefrontSystemPrompt();

  const parts: string[] = [];

  if (input.useCase) {
    const profile = USE_CASE_PROFILES[input.useCase] ?? USE_CASE_PROFILES.other;
    parts.push(`Use case: ${input.useCase}\nDesign direction: ${profile}`);
  }

  parts.push(`\nUser's request:\n${input.prompt}`);

  if (input.referenceUrls?.length) {
    parts.push(`\nReference websites (use for design inspiration, do NOT clone):\n${input.referenceUrls.join("\n")}`);
  }

  if (input.referenceImageUrls?.length) {
    parts.push(`\nReference images provided (use for visual inspiration):\n${input.referenceImageUrls.join("\n")}`);
  }

  if (input.links?.length) {
    const linkList = input.links
      .map((l) => {
        const platform = l.platform ? ` (${l.platform})` : "";
        return `- ${l.url}${platform}`;
      })
      .join("\n");
    parts.push(`\nLinks to include on the page:\n${linkList}`);
  }

  return { systemPrompt, userPrompt: parts.join("\n") };
}

export function buildRegeneratePrompt(input: AIRegenerateInput): {
  systemPrompt: string;
  userPrompt: string;
} {
  const systemPrompt = buildRegenerationSystemPrompt();

  const userPrompt = `Current design specification:
${JSON.stringify(input.existingDesignSpec, null, 2)}

User's modification request:
${input.prompt}

${input.operation ? `Operation type: ${input.operation}` : ""}

Return the complete updated design specification.`;

  return { systemPrompt, userPrompt };
}
