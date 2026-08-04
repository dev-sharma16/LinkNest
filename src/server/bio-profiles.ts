import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validations/bio";
import { DEFAULT_THEME, mergeTheme } from "@/lib/bio-themes";

export const BLOCK_TYPES_LIST = [
  "button",
  "link",
  "text",
  "heading",
  "divider",
  "spacer",
  "image",
  "gallery",
  "video",
  "audio",
  "youtube",
  "spotify",
  "tiktok",
  "instagram",
  "twitter",
  "twitch",
  "vimeo",
  "maps",
  "custom_embed",
  "contact_form",
  "newsletter",
  "html",
  "file_download",
  "pdf_viewer",
];

export async function getProfileByUser(userId: string) {
  return prisma.profile.findUnique({
    where: { userId },
    include: {
      socials: { orderBy: { order: "asc" } },
      blocks: {
        where: { deletedAt: null },
        orderBy: { order: "asc" },
      },
      _count: { select: { events: true, leads: true } },
    },
  });
}

export async function getOrCreateProfile(userId: string) {
  const existing = await getProfileByUser(userId);
  if (existing) return existing;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const baseUsername = (
    user?.name?.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 20) ||
    "creator"
  );
  const username = await uniqueUsername(baseUsername);

  return prisma.profile.create({
    data: {
      userId,
      username,
      displayName: user?.name ?? username,
      appearance: DEFAULT_THEME as unknown as Prisma.InputJsonValue,
    },
    include: {
      socials: { orderBy: { order: "asc" } },
      blocks: { where: { deletedAt: null }, orderBy: { order: "asc" } },
      _count: { select: { events: true, leads: true } },
    },
  });
}

async function uniqueUsername(base: string): Promise<string> {
  let candidate = base || "creator";
  let i = 1;
  while (await prisma.profile.findUnique({ where: { username: candidate } })) {
    candidate = `${base}${i}`;
    i++;
    if (i > 100) candidate = `creator${crypto.randomUUID().slice(0, 4)}`;
  }
  return candidate;
}

export async function updateProfile(userId: string, input: unknown) {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid profile data");
  }
  const data = parsed.data;

  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) throw new Error("Profile not found");

  const username = data.username.toLowerCase();
  if (username !== profile.username) {
    const taken = await prisma.profile.findUnique({
      where: { username },
      select: { id: true },
    });
    if (taken && taken.id !== profile.id) {
      throw new Error("That username is already taken");
    }
  }

  return prisma.profile.update({
    where: { userId },
    data: {
      username,
      displayName: data.displayName,
      bio: data.bio || null,
      location: data.location || null,
      website: data.website || null,
      avatar: data.avatar || null,
      visibility: data.visibility,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      ogImage: data.ogImage || null,
    },
  });
}

export async function setProfilePublished(userId: string, published: boolean) {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) throw new Error("Profile not found");
  return prisma.profile.update({ where: { userId }, data: { published } });
}

export async function updateAppearance(userId: string, appearance: unknown) {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) throw new Error("Profile not found");
  const parsed = { ...DEFAULT_THEME, ...(appearance as object) };
  const clean = normalizeAppearance(parsed);
  return prisma.profile.update({
    where: { userId },
    data: { appearance: clean as unknown as Prisma.InputJsonValue },
  });
}

export function normalizeAppearance(raw: Record<string, unknown>) {
  return mergeTheme(DEFAULT_THEME, raw as never);
}

export async function getPublicProfile(username: string) {
  return prisma.profile.findFirst({
    where: {
      username,
      deletedAt: null,
      published: true,
      visibility: "public",
    },
    include: {
      socials: { where: { url: { not: "" } }, orderBy: { order: "asc" } },
      blocks: {
        where: { deletedAt: null, hidden: false },
        orderBy: { order: "asc" },
        select: { id: true, type: true, config: true },
      },
    },
  });
}

export async function getUrlForUsername(username: string): Promise<string | null> {
  const profile = await prisma.profile.findFirst({
    where: { username, deletedAt: null, published: true, visibility: "public" },
    select: { id: true },
  });
  return profile ? `/u/${encodeURIComponent(username)}` : null;
}