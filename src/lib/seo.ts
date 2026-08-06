import type { Metadata } from "next";
import { APP_URL } from "@/lib/env";

export const SITE_NAME = "LinkNest";
export const SITE_TAGLINE = "Smart links for creators";
export const SITE_DESCRIPTION =
  "LinkNest is the all-in-one creator platform for smart links, link-in-bio pages, QR codes, real-time click analytics and mini storefronts.";

export const SITE_URL = APP_URL.replace(/\/+$/, "");

export const SITE_KEYWORDS = [
  "link shortener",
  "smart links",
  "link in bio",
  "bio page",
  "QR code generator",
  "link analytics",
  "click tracking",
  "URL shortener",
  "creator tools",
  "mini storefront",
  "LinkNest",
];

/** Absolute OG image served by the generated `/og` route (1200×630). */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og`;

/**
 * Resolve a path (or external URL) to a fully qualified URL.
 * External URLs (e.g. ImageKit) pass through untouched.
 */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Collapse whitespace and cap a string for meta descriptions. */
export function truncate(
  text: string | null | undefined,
  max = 158,
): string {
  if (!text) return "";
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

/**
 * Base metadata shared by every page. Spread the `openGraph` / `twitter`
 * fragments when a page needs to override individual fields, since Next.js
 * replaces (not merges) nested metadata objects.
 */
export const siteMetadata: Metadata = {
  applicationName: SITE_NAME,
  generator: SITE_NAME,
  creator: SITE_NAME,
  publisher: SITE_NAME,
  referrer: "origin-when-cross-origin",
  keywords: SITE_KEYWORDS,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: SITE_URL,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

type PageMetadataOptions = {
  title: string;
  description: string;
  /** Route path (e.g. "/login") used for the canonical URL. */
  path: string;
  /** Prevents indexing for token-gated or private pages. */
  noindex?: boolean;
  /** Extra Open Graph fields to merge on top of the site defaults. */
  openGraph?: Metadata["openGraph"];
};

/**
 * Build a complete metadata object for a static page: page title (routed
 * through the root layout template), description, canonical URL and
 * social-sharing tags.
 */
export function pageMetadata({
  title,
  description,
  path,
  noindex = false,
  openGraph,
}: PageMetadataOptions): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      ...siteMetadata.openGraph,
      url,
      title,
      description,
      ...openGraph,
    },
    twitter: {
      ...siteMetadata.twitter,
      title,
      description,
    },
  };
}
