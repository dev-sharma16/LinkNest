export type ExtractedDesignCharacteristics = {
  colors: {
    primary?: string;
    secondary?: string;
    background?: string;
    text?: string;
  };
  fonts: {
    heading?: string;
    body?: string;
  };
  layout: {
    type?: "centered" | "left-aligned" | "right-aligned" | "split";
    maxWidth?: string;
    spacing?: string;
  };
  style: {
    borderRadius?: string;
    buttonStyle?: "solid" | "outline" | "ghost";
    cardStyle?: "flat" | "outlined" | "shadow";
    mood?: "minimal" | "bold" | "warm" | "cool" | "modern" | "classic";
  };
};

const COLOR_REGEX = /#([0-9a-fA-F]{3,8})\b/g;
const RGB_REGEX = /rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/g;
const FONT_FAMILY_REGEX = /font-family\s*:\s*([^;}\n]+)/gi;
const BORDER_RADIUS_REGEX = /border-radius\s*:\s*([^;}\n]+)/gi;

export async function extractDesignFromURL(
  url: string,
): Promise<ExtractedDesignCharacteristics> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "LinkNest-AI/1.0 (Design Extraction)",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return getDefaultCharacteristics();
    }

    const html = await response.text();
    return parseHTMLForDesign(html);
  } catch {
    return getDefaultCharacteristics();
  }
}

function parseHTMLForDesign(html: string): ExtractedDesignCharacteristics {
  const colors = extractColors(html);
  const fonts = extractFonts(html);
  const borderRadius = extractBorderRadius(html);

  return {
    colors: {
      primary: colors[0],
      secondary: colors[1],
      background: colors.find((c) => isLightColor(c)),
      text: colors.find((c) => isDarkColor(c)),
    },
    fonts: {
      heading: fonts[0],
      body: fonts[1] ?? fonts[0],
    },
    layout: {
      type: inferLayout(html),
      maxWidth: "1200px",
      spacing: "16px",
    },
    style: {
      borderRadius: borderRadius[0] ?? "8px",
      buttonStyle: inferButtonStyle(html),
      cardStyle: inferCardStyle(html),
      mood: inferMood(colors, fonts),
    },
  };
}

function extractColors(html: string): string[] {
  const colorSet = new Set<string>();

  let match;
  const colorRegex = new RegExp(COLOR_REGEX.source, "gi");
  while ((match = colorRegex.exec(html)) !== null) {
    const hex = `#${match[1]}`;
    if (hex.length >= 4) {
      colorSet.add(hex);
    }
  }

  const rgbRegex = new RegExp(RGB_REGEX.source, "gi");
  while ((match = rgbRegex.exec(html)) !== null) {
    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);
    colorSet.add(rgbToHex(r, g, b));
  }

  return Array.from(colorSet).slice(0, 10);
}

function extractFonts(html: string): string[] {
  const fonts = new Set<string>();
  let match;

  const regex = new RegExp(FONT_FAMILY_REGEX.source, "gi");
  while ((match = regex.exec(html)) !== null) {
    const family = match[1]
      .split(",")[0]
      .trim()
      .replace(/['"]/g, "");
    if (family && !["serif", "sans-serif", "monospace", "cursive", "fantasy"].includes(family.toLowerCase())) {
      fonts.add(family);
    }
  }

  return Array.from(fonts).slice(0, 5);
}

function extractBorderRadius(html: string): string[] {
  const radii = new Set<string>();
  let match;

  const regex = new RegExp(BORDER_RADIUS_REGEX.source, "gi");
  while ((match = regex.exec(html)) !== null) {
    radii.add(match[1].trim().split(/\s+/)[0]);
  }

  return Array.from(radii).slice(0, 3);
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")
  );
}

function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.7;
}

function isDarkColor(hex: string): boolean {
  return !isLightColor(hex);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function inferLayout(html: string): "centered" | "left-aligned" | "right-aligned" | "split" {
  if (/text-align\s*:\s*center/i.test(html) || /mx-auto/i.test(html)) {
    return "centered";
  }
  if (/text-align\s*:\s*right/i.test(html)) {
    return "right-aligned";
  }
  if (/grid-template-columns.*repeat\s*\(\s*2/i.test(html) || /flex.*gap/i.test(html)) {
    return "split";
  }
  return "centered";
}

function inferButtonStyle(html: string): "solid" | "outline" | "ghost" {
  if (/border\s*:\s*\d+px\s+solid/i.test(html) && /background(-color)?\s*:\s*transparent/i.test(html)) {
    return "outline";
  }
  if (/background(-color)?\s*:\s*transparent/i.test(html)) {
    return "ghost";
  }
  return "solid";
}

function inferCardStyle(html: string): "flat" | "outlined" | "shadow" {
  if (/box-shadow/i.test(html)) {
    return "shadow";
  }
  if (/border\s*:\s*\d+px\s+solid/i.test(html)) {
    return "outlined";
  }
  return "flat";
}

function inferMood(
  colors: string[],
  fonts: string[],
): "minimal" | "bold" | "warm" | "cool" | "modern" | "classic" {
  const hasSerif = fonts.some((f) => /serif|georgia|times|garamond/i.test(f));
  const hasWarmColor = colors.some((c) => {
    const rgb = hexToRgb(c);
    if (!rgb) return false;
    return rgb.r > rgb.b && rgb.r > 100;
  });
  const hasCoolColor = colors.some((c) => {
    const rgb = hexToRgb(c);
    if (!rgb) return false;
    return rgb.b > rgb.r && rgb.b > 100;
  });

  if (hasSerif) return "classic";
  if (hasWarmColor) return "warm";
  if (hasCoolColor) return "cool";
  if (colors.length <= 3) return "minimal";
  if (colors.length >= 6) return "bold";
  return "modern";
}

function getDefaultCharacteristics(): ExtractedDesignCharacteristics {
  return {
    colors: {},
    fonts: {},
    layout: { type: "centered", maxWidth: "1200px", spacing: "16px" },
    style: { mood: "modern" },
  };
}
