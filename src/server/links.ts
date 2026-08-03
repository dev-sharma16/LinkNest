import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { password } from "@/lib/password";
import { normalizeSlug, randomSlug, isSlugTaken } from "@/lib/url";
import { createLinkSchema } from "@/lib/validations/links";
import { APP_URL } from "@/lib/env";
import type { SessionUser } from "@/lib/session";

export type LinkListQuery = {
  search?: string;
  folderId?: string;
  tagId?: string;
  archived?: boolean;
  favorite?: boolean;
  sort?: "createdAt" | "clicks" | "title";
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

const PAGE_SIZE = 12;

function buildWhere(userId: string, query: LinkListQuery) {
  const where: Prisma.LinkWhereInput = {
    userId,
    deletedAt: null,
  };

  if (query.archived) {
    where.isArchived = true;
  } else if (query.archived === false) {
    where.isArchived = false;
  }

  if (query.search) {
    where.OR = [
      { slug: { contains: query.search, mode: "insensitive" } },
      { destination: { contains: query.search, mode: "insensitive" } },
      { title: { contains: query.search, mode: "insensitive" } },
    ];
  }

  if (query.folderId) {
    where.folderId = query.folderId;
  }

  if (query.favorite) {
    where.favorites = { some: { userId } };
  }

  if (query.tagId) {
    where.tags = { some: { tagId: query.tagId } };
  }

  return where;
}

function buildOrderBy(query: LinkListQuery): Prisma.LinkOrderByWithRelationInput[] {
  const order = query.order ?? "desc";
  switch (query.sort) {
    case "clicks":
      return [{ clicks: { _count: order } }];
    case "title":
      return [{ title: order as "asc" | "desc" }, { createdAt: "desc" }];
    default:
      return [{ createdAt: order as "asc" | "desc" }];
  }
}

export async function listLinks(userId: string, query: LinkListQuery = {}) {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, query.pageSize ?? PAGE_SIZE));

  const where = buildWhere(userId, query);
  const orderBy = buildOrderBy(query);

  const [items, total] = await Promise.all([
    prisma.link.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        folder: { select: { id: true, name: true } },
        tags: { include: { tag: { select: { id: true, name: true } } } },
        favorites: { where: { userId }, select: { linkId: true } },
        qrCode: { select: { id: true } },
        _count: { select: { clicks: true } },
      },
    }),
    prisma.link.count({ where }),
  ]);

  return {
    items: items.map(({ favorites, tags, _count, ...link }) => ({
      ...link,
      isFavorite: favorites.length > 0,
      tags: tags.map((t) => t.tag),
      clickCount: _count.clicks,
      shortUrl: `${APP_URL}/${link.slug}`,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

async function findUniqueSlug(userId: string, preferred?: string) {
  const raw = preferred?.trim();
  if (raw) {
    const slug = normalizeSlug(raw);
    const existing = await prisma.link.findUnique({ where: { slug } });
    if (!existing) return slug;
    throw new Error("That slug is already taken. Try a different one.");
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = randomSlug(6);
    const existing = await prisma.link.findUnique({ where: { slug } });
    if (!existing) return slug;
  }
  throw new Error("Could not generate a unique slug. Try again.");
}

export async function createLink(user: SessionUser, input: unknown) {
  const parsed = createLinkSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid link data");
  }
  const data = parsed.data;

  const slug = await findUniqueSlug(user.id, data.slug);

  try {
    const link = await prisma.link.create({
      data: {
        slug,
        destination: data.destination,
        title: data.title || null,
        description: data.description || null,
        notes: data.notes || null,
        userId: user.id,
        folderId: data.folderId || null,
        passwordHash: data.password ? await password.hash(data.password) : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        activateAt: data.activateAt ? new Date(data.activateAt) : null,
        active: true,
        utmSource: data.utmSource || null,
        utmMedium: data.utmMedium || null,
        utmCampaign: data.utmCampaign || null,
        utmTerm: data.utmTerm || null,
        utmContent: data.utmContent || null,
        iosDeepLink: data.iosDeepLink || null,
        androidDeepLink: data.androidDeepLink || null,
        tags: data.tagIds?.length
          ? {
              create: data.tagIds.map((tagId) => ({ tagId })),
            }
          : undefined,
      },
      include: {
        folder: { select: { id: true, name: true } },
        tags: { include: { tag: { select: { id: true, name: true } } } },
        _count: { select: { clicks: true } },
      },
    });

    return {
      ...link,
      tags: link.tags.map((t) => t.tag),
      shortUrl: `${APP_URL}/${link.slug}`,
    };
  } catch (error) {
    if (isSlugTaken(error)) {
      throw new Error("That slug is already taken. Try a different one.");
    }
    throw error;
  }
}

export async function getLinkForUser(userId: string, linkId: string) {
  const link = await prisma.link.findFirst({
    where: { id: linkId, userId, deletedAt: null },
    include: {
      folder: { select: { id: true, name: true } },
      tags: { include: { tag: { select: { id: true, name: true } } } },
      qrCode: true,
      _count: { select: { clicks: true } },
    },
  });
  if (!link) return null;
  const { tags, ...rest } = link;
  return { ...rest, tags: tags.map((t) => t.tag), shortUrl: `${APP_URL}/${link.slug}` };
}

export async function updateLink(
  userId: string,
  linkId: string,
  input: unknown,
) {
  const parsed = createLinkSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid link data");
  }
  const data = parsed.data;

  const existing = await prisma.link.findFirst({
    where: { id: linkId, userId, deletedAt: null },
  });
  if (!existing) throw new Error("Link not found");

  const slug =
    data.slug && normalizeSlug(data.slug) !== existing.slug
      ? await findUniqueSlug(userId, data.slug)
      : existing.slug;

  return prisma.$transaction(async (tx) => {
    const link = await tx.link.update({
      where: { id: linkId },
      data: {
        slug,
        destination: data.destination,
        title: data.title || null,
        description: data.description || null,
        notes: data.notes || null,
        folderId: data.folderId || null,
        passwordHash:
          data.password === undefined
            ? existing.passwordHash
            : data.password
              ? await password.hash(data.password)
              : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        activateAt: data.activateAt ? new Date(data.activateAt) : null,
        utmSource: data.utmSource || null,
        utmMedium: data.utmMedium || null,
        utmCampaign: data.utmCampaign || null,
        utmTerm: data.utmTerm || null,
        utmContent: data.utmContent || null,
        iosDeepLink: data.iosDeepLink || null,
        androidDeepLink: data.androidDeepLink || null,
      },
    });

    if (data.tagIds) {
      await tx.linkTag.deleteMany({ where: { linkId } });
      if (data.tagIds.length) {
        await tx.linkTag.createMany({
          data: data.tagIds.map((tagId) => ({ linkId, tagId })),
        });
      }
    }

    return link;
  });
}

export async function deleteLinks(userId: string, ids: string[]) {
  if (!ids.length) return { count: 0 };
  const result = await prisma.link.updateMany({
    where: { id: { in: ids }, userId, deletedAt: null },
    data: { deletedAt: new Date() },
  });
  return { count: result.count };
}

export async function restoreLinks(userId: string, ids: string[]) {
  if (!ids.length) return { count: 0 };
  const result = await prisma.link.updateMany({
    where: { id: { in: ids }, userId, deletedAt: { not: null } },
    data: { deletedAt: null },
  });
  return { count: result.count };
}

export async function setArchived(userId: string, ids: string[], archived: boolean) {
  if (!ids.length) return { count: 0 };
  const result = await prisma.link.updateMany({
    where: { id: { in: ids }, userId, deletedAt: null },
    data: { isArchived: archived },
  });
  return { count: result.count };
}

export async function setFavorite(userId: string, linkId: string, favorite: boolean) {
  const link = await prisma.link.findFirst({
    where: { id: linkId, userId, deletedAt: null },
    select: { id: true },
  });
  if (!link) throw new Error("Link not found");

  if (favorite) {
    await prisma.favorite.upsert({
      where: { linkId_userId: { linkId, userId } },
      create: { linkId, userId },
      update: {},
    });
  } else {
    await prisma.favorite.deleteMany({ where: { linkId, userId } });
  }
  return { favorite };
}

export async function verifyLinkPassword(linkId: string, candidate: string) {
  const link = await prisma.link.findUnique({
    where: { id: linkId },
    select: { passwordHash: true },
  });
  if (!link?.passwordHash) return true;
  return password.verify(candidate, link.passwordHash);
}