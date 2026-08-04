import type { CSSProperties } from "react";
import type { ThemeStyleValues } from "@/lib/validations/bio";
import { DEFAULT_THEME, mergeTheme } from "@/lib/bio-themes";

export function toTheme(theme: Record<string, unknown> | null | undefined): ThemeStyleValues {
  return mergeTheme(DEFAULT_THEME, (theme ?? {}) as Partial<ThemeStyleValues>);
}

export function backgroundStyle(theme: ThemeStyleValues): CSSProperties {
  if (theme.backgroundType === "gradient") {
    return {
      background: `linear-gradient(180deg, ${theme.gradientFrom}, ${theme.gradientTo})`,
    };
  }
  if (theme.backgroundType === "image" && theme.backgroundImage) {
    return {
      backgroundImage: `url("${theme.backgroundImage}")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  return { backgroundColor: theme.backgroundColor };
}

export function themeVars(theme: ThemeStyleValues): CSSProperties {
  return {
    "--bio-primary": theme.primaryColor,
    "--bio-secondary": theme.secondaryColor,
    "--bio-accent": theme.accentColor,
    "--bio-text": theme.textColor,
    "--bio-btn-bg": theme.buttonBackground,
    "--bio-btn-text": theme.buttonText,
    "--bio-btn-radius": theme.buttonRadius,
    "--bio-spacing": theme.blockSpacing,
    "--bio-font-size": theme.fontSize,
    "--bio-font-weight": theme.fontWeight,
    "--bio-card": theme.backgroundColor,
    "--bio-align": theme.alignment,
    fontFamily: theme.fontFamily,
    ...backgroundStyle(theme),
  } as CSSProperties;
}

function getYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/,
  );
  return match?.[1] ?? null;
}

function getSpotifyId(url: string): { type: string; id: string } | null {
  const match = url.match(/open\.spotify\.com\/(\w+)\/([a-zA-Z0-9]+)/);
  return match ? { type: match[1], id: match[2] } : null;
}

function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match?.[1] ?? null;
}

export function getEmbedSrc(type: string, config: Record<string, unknown>): string {
  const url = String(config.url ?? "");
  switch (type) {
    case "youtube": {
      const id = getYoutubeId(url);
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    case "spotify": {
      const s = getSpotifyId(url);
      return s ? `https://open.spotify.com/embed/${s.type}/${s.id}` : url;
    }
    case "vimeo": {
      const id = getVimeoId(url);
      return id ? `https://player.vimeo.com/video/${id}` : url;
    }
    case "instagram":
      return buildInstagramEmbed(url);
    case "tiktok":
      return buildTikTokEmbed(url);
    case "twitter":
      return buildTwitterEmbed(url);
    case "maps":
      return buildMapsEmbed(url, String(config.query ?? ""));
    case "twitch":
      return url;
    case "custom_embed":
    default:
      return url;
  }
}

function buildInstagramEmbed(url: string): string {
  const id = url.match(/instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/)?.[1];
  return id
    ? `https://www.instagram.com/p/${id}/embed`
    : url;
}

function buildTikTokEmbed(url: string): string {
  const id = url.match(/tiktok\.com\/@?[\w.-]+\/video\/(\d+)/)?.[1];
  return id
    ? `https://www.tiktok.com/embed/${id}`
    : `https://www.tiktok.com/embed`;
}

function buildTwitterEmbed(url: string): string {
  return `https://twitframe.com/show?url=${encodeURIComponent(url)}`;
}

function buildMapsEmbed(url: string, query: string): string {
  const place = query || decodePlace(url);
  return place
    ? `https://www.google.com/maps?q=${encodeURIComponent(place)}&output=embed`
    : url;
}

function decodePlace(url: string): string {
  try {
    const u = new URL(url);
    const q = u.searchParams.get("q");
    return q ?? "";
  } catch {
    return "";
  }
}

export function isInteractiveBlock(type: string): boolean {
  return ["button", "link", "file_download"].includes(type);
}