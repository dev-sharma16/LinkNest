import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { toTheme, themeVars } from "@/lib/bio-css";
import { ViewTracker } from "@/components/bio/public/view-tracker";
import { BlockRenderer } from "@/components/bio/public/blocks";
import { JsonLd } from "@/components/seo/json-ld";
import {
  absoluteUrl,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  siteMetadata,
  truncate,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

// Shared by generateMetadata, generateViewport and the page so the profile
// is only fetched once per request.
const getPublicProfile = cache((username: string) =>
  prisma.profile.findFirst({
    where: { username, published: true, visibility: "public", deletedAt: null },
    include: {
      socials: { where: { url: { not: "" } }, orderBy: { order: "asc" } },
      blocks: {
        where: { deletedAt: null, hidden: false },
        orderBy: { order: "asc" },
        select: {
          id: true,
          type: true,
          config: true,
          hidden: true,
          scheduleStartAt: true,
          scheduleEndAt: true,
          order: true,
        },
      },
    },
  }),
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublicProfile(username);
  if (!profile) return { title: "Profile not found" };

  const title = profile.seoTitle || profile.displayName;
  const description = truncate(
    profile.seoDescription ||
      profile.bio ||
      `${profile.displayName}'s page on ${SITE_NAME}`,
  );
  const url = absoluteUrl(`/u/${encodeURIComponent(profile.username)}`);
  const images = [
    profile.ogImage || profile.avatar || DEFAULT_OG_IMAGE,
  ].filter(Boolean) as string[];

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      ...siteMetadata.openGraph,
      type: "profile",
      url,
      title,
      description,
      images,
    },
    twitter: {
      ...siteMetadata.twitter,
      title,
      description,
      images,
    },
  };
}

export async function generateViewport({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Viewport> {
  const { username } = await params;
  const profile = await getPublicProfile(username);
  if (!profile) return {};
  const theme = toTheme(profile.appearance as Record<string, unknown> | null);
  return { themeColor: theme.backgroundColor };
}

export default async function BioPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getPublicProfile(username);
  if (!profile) notFound();

  const appearance = (profile.appearance ?? {}) as Record<string, unknown> | null;
  const theme = toTheme(appearance);

  return (
    <main
      style={themeVars(theme)}
      className="min-h-dvh px-4 py-10 text-foreground"
    >
      <ViewTracker username={profile.username} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: profile.displayName,
          url: absoluteUrl(`/u/${encodeURIComponent(profile.username)}`),
          image: profile.avatar ? absoluteUrl(profile.avatar) : undefined,
          description: profile.bio ?? undefined,
          sameAs: profile.socials.map((s) => s.url),
        }}
      />

      <div
        className="mx-auto w-full max-w-md"
        style={{ textAlign: theme.alignment }}
      >
        {profile.avatar ? (
          <div className="bio-animate" style={{ animation: "bio-rise 0.5s ease-out both" }}>
            <img
              src={profile.avatar}
              alt={profile.displayName}
              width={104}
              height={104}
              className="mx-auto rounded-full border object-cover transition-transform duration-300 hover:scale-105"
              style={{
                borderColor: "color-mix(in srgb, var(--bio-primary) 40%, transparent)",
                boxShadow: "0 0 0 4px color-mix(in srgb, var(--bio-primary) 14%, transparent), 0 10px 30px rgba(0,0,0,0.12)",
              }}
            />
          </div>
        ) : null}

        <h1
          className="bio-animate mt-4 text-2xl font-bold tracking-tight"
          style={{
            fontSize: "calc(var(--bio-font-size) + 6px)",
            animation: "bio-rise 0.5s ease-out 0.08s both",
          }}
        >
          {profile.displayName}
          {profile.verified ? (
            <span
              className="ml-1 inline-flex items-center justify-center"
              title="Verified"
              style={{ color: "var(--bio-primary)" }}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-label="Verified">
                <path d="M12 1.5l2.4 2.4 3.4-.5 1 3.3 3.2 1.3-1 3.4 1.9 2.9-2.6 2.2.4 3.4-3.4.7-1.7 3-3.1-1.4-2.6 2L9.6 21l-3.4-.7-.4-3.4L3.2 14.9l1-3.4L1 10.2l1.3-3.2 3.3-1 .6-3.4 3.4.5L12 1.5z" />
              </svg>
            </span>
          ) : null}
        </h1>

        {profile.bio ? (
          <p className="bio-animate mt-2 text-base opacity-80" style={{ animation: "bio-rise 0.5s ease-out 0.16s both" }}>
            {profile.bio}
          </p>
        ) : null}

        {profile.location ? (
          <p className="bio-animate mt-1 text-sm opacity-60" style={{ animation: "bio-rise 0.5s ease-out 0.2s both" }}>
            {profile.location}
          </p>
        ) : null}

        {profile.website ? (
          <a
            href={
              /^https?:\/\//i.test(profile.website)
                ? profile.website
                : `https://${profile.website}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="bio-animate mt-1 inline-block text-sm underline opacity-70 transition-opacity hover:opacity-100"
            style={{ animation: "bio-rise 0.5s ease-out 0.24s both" }}
          >
            {profile.website.replace(/^https?:\/\//, "")}
          </a>
        ) : null}

        {profile.socials.length > 0 ? (
          <div
            className="bio-animate mt-4 flex flex-wrap items-center justify-center gap-2"
            style={{ justifyContent: theme.alignment === "center" ? "center" : theme.alignment, animation: "bio-rise 0.5s ease-out 0.28s both" }}
          >
            {profile.socials.map((s) => (
              <SocialBadge key={s.id} platform={s.platform} url={s.url} username={profile.username} socialId={s.id} />
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-6">
        <BlockRenderer blocks={profile.blocks as never} username={profile.username} theme={appearance} />
      </div>

      <footer className="mx-auto mt-12 w-full max-w-md text-center text-xs opacity-40">
        Made with LinkNest
      </footer>
    </main>
  );
}

function SocialBadge({
  platform,
  url,
}: {
  platform: string;
  url: string;
  username: string;
  socialId: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold capitalize transition-all duration-200 hover:-translate-y-0.5 hover:scale-105"
      style={{
        background: "color-mix(in srgb, var(--bio-text) 10%, transparent)",
        color: "var(--bio-text)",
      }}
      aria-label={platform}
    >
      {platform === "twitter" ? "X" : platform.slice(0, 2).toUpperCase()}
    </a>
  );
}