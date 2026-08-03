const ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function randomSlug(length = 6): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

export function normalizeSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

export function isSlugTaken(error: unknown): boolean {
  const err = error as { meta?: { target?: string[] }; code?: string };
  return (
    err?.code === "P2002" ||
    (Array.isArray(err?.meta?.target) && err.meta.target.includes("slug"))
  );
}

export type UtmParams = {
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
};

export function appendUtm(destination: string, utm: UtmParams): string {
  const parts: [string, string][] = [];
  if (utm.utmSource) parts.push(["utm_source", utm.utmSource]);
  if (utm.utmMedium) parts.push(["utm_medium", utm.utmMedium]);
  if (utm.utmCampaign) parts.push(["utm_campaign", utm.utmCampaign]);
  if (utm.utmTerm) parts.push(["utm_term", utm.utmTerm]);
  if (utm.utmContent) parts.push(["utm_content", utm.utmContent]);
  if (!parts.length) return destination;

  try {
    const url = new URL(destination);
    for (const [key, value] of parts) {
      url.searchParams.set(key, value);
    }
    return url.toString();
  } catch {
    return destination;
  }
}