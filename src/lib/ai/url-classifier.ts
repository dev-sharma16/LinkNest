export type URLClassification = {
  type: "social" | "product" | "website" | "embed" | "unknown";
  platform?: string;
  category?: string;
};

const URL_PATTERNS: Array<{
  pattern: RegExp;
  type: URLClassification["type"];
  platform: string;
  category?: string;
}> = [
  { pattern: /instagram\.com/i, type: "social", platform: "instagram", category: "social" },
  { pattern: /twitter\.com|x\.com/i, type: "social", platform: "twitter", category: "social" },
  { pattern: /youtube\.com|youtu\.be/i, type: "social", platform: "youtube", category: "video" },
  { pattern: /tiktok\.com/i, type: "social", platform: "tiktok", category: "video" },
  { pattern: /linkedin\.com/i, type: "social", platform: "linkedin", category: "professional" },
  { pattern: /facebook\.com/i, type: "social", platform: "facebook", category: "social" },
  { pattern: /github\.com/i, type: "social", platform: "github", category: "development" },
  { pattern: /twitch\.tv/i, type: "social", platform: "twitch", category: "streaming" },
  { pattern: /discord\.gg|discord\.com/i, type: "social", platform: "discord", category: "community" },
  { pattern: /open\.spotify\.com/i, type: "social", platform: "spotify", category: "music" },
  { pattern: /pinterest\.com/i, type: "social", platform: "pinterest", category: "social" },
  { pattern: /snapchat\.com/i, type: "social", platform: "snapchat", category: "social" },
  { pattern: /threads\.net/i, type: "social", platform: "threads", category: "social" },

  { pattern: /amazon\.(com|co\.uk|de|fr|ca|com\.au)/i, type: "product", platform: "amazon", category: "marketplace" },
  { pattern: /shopify\.com|myshopify\.com/i, type: "product", platform: "shopify", category: "storefront" },
  { pattern: /etsy\.com/i, type: "product", platform: "etsy", category: "marketplace" },
  { pattern: /ebay\.com/i, type: "product", platform: "ebay", category: "marketplace" },
  { pattern: /gumroad\.com/i, type: "product", platform: "gumroad", category: "digital" },
  { pattern: /lemonsqueezy\.com/i, type: "product", platform: "lemonsqueezy", category: "digital" },
  { pattern: /buymeacoffee\.com/i, type: "product", platform: "buymeacoffee", category: "support" },
  { pattern: /patreon\.com/i, type: "product", platform: "patreon", category: "support" },
  { pattern: /ko-fi\.com/i, type: "product", platform: "kofi", category: "support" },
  { pattern: /stripe\.com/i, type: "product", platform: "stripe", category: "payment" },

  { pattern: /vimeo\.com|player\.vimeo\.com/i, type: "embed", platform: "vimeo", category: "video" },
  { pattern: /google\.com\/maps|maps\.app\.goo\.gl/i, type: "embed", platform: "maps", category: "location" },
  { pattern: /figma\.com/i, type: "embed", platform: "figma", category: "design" },
  { pattern: /codepen\.io/i, type: "embed", platform: "codepen", category: "development" },
  { pattern: /codesandbox\.io/i, type: "embed", platform: "codesandbox", category: "development" },
];

export function classifyURL(url: string): URLClassification {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    for (const entry of URL_PATTERNS) {
      if (entry.pattern.test(hostname) || entry.pattern.test(url)) {
        return {
          type: entry.type,
          platform: entry.platform,
          category: entry.category,
        };
      }
    }

    return { type: "website" };
  } catch {
    return { type: "unknown" };
  }
}

export function classifyURLs(urls: string[]): URLClassification[] {
  return urls.map(classifyURL);
}

export function getSocialPlatformFromURL(url: string): string | null {
  const classification = classifyURL(url);
  if (classification.type === "social" && classification.platform) {
    return classification.platform;
  }
  return null;
}

export function isProductURL(url: string): boolean {
  return classifyURL(url).type === "product";
}

export function isEmbeddableURL(url: string): boolean {
  const classification = classifyURL(url);
  return classification.type === "embed" || classification.type === "social";
}
