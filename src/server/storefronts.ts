import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  storefrontSchema,
  storefrontCreateSchema,
  slugField,
} from "@/lib/validations/storefront";
import { STOREFRONT_DEFAULT_THEME } from "@/lib/storefront-themes";

export async function listStorefronts(userId: string) {
  return prisma.storefront.findMany({
    where: { userId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { products: true, events: true } },
    },
  });
}

export async function getStorefront(userId: string, storefrontId: string) {
  return prisma.storefront.findFirst({
    where: { id: storefrontId, userId, deletedAt: null },
    include: {
      products: {
        where: { deletedAt: null },
        orderBy: [{ featured: "desc" }, { order: "asc" }],
      },
      _count: { select: { products: true, events: true } },
    },
  });
}

export async function createStorefront(userId: string, input: unknown) {
  const parsed = storefrontCreateSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid storefront data");
  }
  const data = parsed.data;

  const slug = await uniqueSlug(data.slug || slugFromName(data.name));

  return prisma.storefront.create({
    data: {
      userId,
      name: data.name,
      slug,
      description: data.description || null,
      coverImage: data.coverImage || null,
      bannerImage: data.bannerImage || null,
      visibility: data.visibility,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      ogImage: data.ogImage || null,
      appearance: STOREFRONT_DEFAULT_THEME as unknown as Prisma.InputJsonValue,
    },
    include: {
      _count: { select: { products: true, events: true } },
    },
  });
}

export async function updateStorefront(
  userId: string,
  storefrontId: string,
  input: unknown,
) {
  const parsed = storefrontSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid storefront data");
  }
  const data = parsed.data;

  const storefront = await getOwnedStorefront(userId, storefrontId);
  if (!storefront) throw new Error("Storefront not found");

  const slug = data.slug.toLowerCase();
  if (slug !== storefront.slug) {
    const taken = await prisma.storefront.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (taken && taken.id !== storefront.id) {
      throw new Error("That slug is already taken");
    }
  }

  return prisma.storefront.update({
    where: { id: storefrontId },
    data: {
      name: data.name,
      slug,
      description: data.description || null,
      coverImage: data.coverImage || null,
      bannerImage: data.bannerImage || null,
      visibility: data.visibility,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      ogImage: data.ogImage || null,
    },
  });
}

export async function deleteStorefront(userId: string, storefrontId: string) {
  const storefront = await getOwnedStorefront(userId, storefrontId);
  if (!storefront) throw new Error("Storefront not found");
  return prisma.storefront.update({
    where: { id: storefrontId },
    data: { deletedAt: new Date() },
  });
}

export async function duplicateStorefront(userId: string, storefrontId: string) {
  const storefront = await getOwnedStorefront(userId, storefrontId);
  if (!storefront) throw new Error("Storefront not found");

  const products = await prisma.productCard.findMany({
    where: { storefrontId, deletedAt: null },
    orderBy: { order: "asc" },
  });

  const slug = await uniqueSlug(`${storefront.slug}-copy`);

  const copy = await prisma.storefront.create({
    data: {
      userId,
      name: `${storefront.name} (copy)`,
      slug,
      description: storefront.description,
      coverImage: storefront.coverImage,
      bannerImage: storefront.bannerImage,
      visibility: "private",
      published: false,
      seoTitle: storefront.seoTitle,
      seoDescription: storefront.seoDescription,
      ogImage: storefront.ogImage,
      appearance: storefront.appearance as Prisma.InputJsonValue | undefined,
      products: {
        create: products.map((p, index) => ({
          title: p.title,
          description: p.description,
          image: p.image,
          url: p.url,
          ctaText: p.ctaText,
          featured: p.featured,
          order: index,
        })),
      },
    },
  });

  return prisma.storefront.findUnique({
    where: { id: copy.id },
    include: {
      products: { where: { deletedAt: null }, orderBy: [{ featured: "desc" }, { order: "asc" }] },
      _count: { select: { products: true, events: true } },
    },
  });
}

export async function setStorefrontPublished(
  userId: string,
  storefrontId: string,
  published: boolean,
) {
  const storefront = await getOwnedStorefront(userId, storefrontId);
  if (!storefront) throw new Error("Storefront not found");
  return prisma.storefront.update({ where: { id: storefrontId }, data: { published } });
}

export async function setStorefrontArchived(
  userId: string,
  storefrontId: string,
  archived: boolean,
) {
  const storefront = await getOwnedStorefront(userId, storefrontId);
  if (!storefront) throw new Error("Storefront not found");
  return prisma.storefront.update({ where: { id: storefrontId }, data: { archived } });
}

export async function updateStorefrontAppearance(
  userId: string,
  storefrontId: string,
  appearance: unknown,
) {
  const storefront = await getOwnedStorefront(userId, storefrontId);
  if (!storefront) throw new Error("Storefront not found");

  const merged = {
    ...STOREFRONT_DEFAULT_THEME,
    ...(appearance as object),
  };

  return prisma.storefront.update({
    where: { id: storefrontId },
    data: { appearance: merged as unknown as Prisma.InputJsonValue },
  });
}

export async function getPublicStorefront(slug: string) {
  return prisma.storefront.findFirst({
    where: {
      slug,
      deletedAt: null,
      archived: false,
      published: true,
      visibility: "public",
    },
    include: {
      products: {
        where: { deletedAt: null },
        orderBy: [{ featured: "desc" }, { order: "asc" }],
        select: {
          id: true,
          title: true,
          description: true,
          image: true,
          url: true,
          ctaText: true,
          featured: true,
          order: true,
        },
      },
    },
  });
}

export async function getStorefrontIdBySlug(slug: string) {
  const storefront = await prisma.storefront.findFirst({
    where: {
      slug,
      deletedAt: null,
      archived: false,
      published: true,
      visibility: "public",
    },
    select: { id: true },
  });
  return storefront?.id ?? null;
}

async function getOwnedStorefront(userId: string, storefrontId: string) {
  return prisma.storefront.findFirst({
    where: { id: storefrontId, userId, deletedAt: null },
  });
}

function slugFromName(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return base || "store";
}

async function uniqueSlug(base: string): Promise<string> {
  const candidate = slugField.safeParse(base);
  let candidateSlug = candidate.success ? base : "store";
  let i = 1;
  while (
    await prisma.storefront.findUnique({
      where: { slug: candidateSlug },
      select: { id: true },
    })
  ) {
    candidateSlug = `${base}-${i}`.slice(0, 40);
    i++;
    if (i > 100) candidateSlug = `store-${crypto.randomUUID().slice(0, 4)}`;
  }
  return candidateSlug;
}
