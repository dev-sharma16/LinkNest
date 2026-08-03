import { createHash } from "node:crypto";
import { env } from "@/lib/env";

export type ParsedClient = {
  browser: string | null;
  os: string | null;
  device: string | null;
  isBot: boolean;
};

const BOT_PATTERN =
  /bot|crawl|spider|slurp|bingpreview|googlebot|facebot|duckduckbot|baiduspider|yandex|monitor|uptime|curl|wget|python-requests/i;

export function parseUserAgent(userAgent?: string | null): ParsedClient {
  if (!userAgent) {
    return { browser: null, os: null, device: null, isBot: false };
  }

  const ua = userAgent;
  let browser: string | null = null;
  let os: string | null = null;
  let device: string | null = "Desktop";

  // OS
  if (/windows nt/i.test(ua)) os = "Windows";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/mac os x/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";
  else if (/crkey/i.test(ua)) os = "Chrome OS";
  else if (/cros/i.test(ua)) os = "Chrome OS";

  // Browser
  if (/edg(e|a|ios|aios)\//i.test(ua)) browser = "Edge";
  else if (/opr\//i.test(ua) || /opera/i.test(ua)) browser = "Opera";
  else if (/brave/i.test(ua)) browser = "Brave";
  else if (/firefox\/|fxios/i.test(ua)) browser = "Firefox";
  else if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/safari\//i.test(ua)) browser = "Safari";

  // Device
  if (/ipad/i.test(ua)) device = "Tablet";
  else if (/iphone/i.test(ua)) device = "Mobile";
  else if (/android/i.test(ua)) device = /mobile/i.test(ua) ? "Mobile" : "Tablet";
  else if (/tablet|playbook|silk/i.test(ua)) device = "Tablet";
  else if (/mobile/i.test(ua)) device = "Mobile";

  const isBot = BOT_PATTERN.test(ua);

  return { browser, os, device, isBot };
}

export function hashIp(ip: string): string {
  return createHash("sha256")
    .update(`${ip}::${env.BETTER_AUTH_SECRET}`)
    .digest("hex");
}

export function getClientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip");
}

export function referrerHost(referrer?: string | null): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).host;
  } catch {
    return null;
  }
}

type GeoResult = { country?: string | null; city?: string | null };

export async function lookupGeo(ip: string): Promise<GeoResult> {
  try {
    // ipapi.co free tier - best effort, non-blocking on the critical path.
    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return {};
    const data = (await res.json()) as { country?: string; city?: string };
    return { country: data.country ?? null, city: data.city ?? null };
  } catch {
    return {};
  }
}