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
          <img
            src={profile.avatar}
            alt={profile.displayName}
            width={96}
            height={96}
            className="mx-auto rounded-full border object-cover shadow-sm"
          />
        ) : null}

        <h1
          className="mt-4 text-2xl font-bold tracking-tight"
          style={{ fontSize: "calc(var(--bio-font-size) + 6px)" }}
        >
          {profile.displayName}
          {profile.verified ? " ✓" : ""}
        </h1>

        {profile.bio ? (
          <p className="mt-2 text-base opacity-80">{profile.bio}</p>
        ) : null}

        {profile.location ? (
          <p className="mt-1 text-sm opacity-60">{profile.location}</p>
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
            className="mt-1 inline-block text-sm underline opacity-70"
          >
            {profile.website.replace(/^https?:\/\//, "")}
          </a>
        ) : null}

        {profile.socials.length > 0 ? (
          <div
            className="mt-4 flex flex-wrap items-center justify-center gap-2"
            style={{ justifyContent: theme.alignment === "center" ? "center" : theme.alignment }}
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
      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/10 text-sm font-medium capitalize transition-opacity hover:opacity-80"
      aria-label={platform}
    >
      {platform === "twitter" ? "X" : platform.slice(0, 2).toUpperCase()}
    </a>
  );
}