import { prisma } from "@/lib/prisma";
import {
  productCardSchema,
  reorderProductsSchema,
  productBulkSchema,
} from "@/lib/validations/storefront";
import { getStorefront } from "@/server/storefronts";

export async function listProducts(userId: string, storefrontId: string) {
  const storefront = await getStorefront(userId, storefrontId);
  if (!storefront) return [];
  return prisma.productCard.findMany({
    where: { storefrontId, deletedAt: null },
    orderBy: [{ featured: "desc" }, { order: "asc" }],
  });
}

export async function createProduct(userId: string, storefrontId: string, input: unknown) {
  const parsed = productCardSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid product");
  }
  const storefront = await getStorefront(userId, storefrontId);
  if (!storefront) throw new Error("Storefront not found");

  const maxOrder = await prisma.productCard.aggregate({
    where: { storefrontId, deletedAt: null },
    _max: { order: true },
  });

  return prisma.productCard.create({
    data: {
      storefrontId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      image: parsed.data.image || null,
      url: parsed.data.url,
      ctaText: parsed.data.ctaText || null,
      featured: parsed.data.featured,
      order: parsed.data.order ?? (maxOrder._max.order ?? -1) + 1,
    },
  });
}

export async function updateProduct(
  userId: string,
  storefrontId: string,
  productId: string,
  input: unknown,
) {
  const parsed = productCardSchema.partial().safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid product");
  }
  const product = await getOwnedProduct(userId, storefrontId, productId);
  if (!product) throw new Error("Product not found");

  const data = parsed.data;
  return prisma.productCard.update({
    where: { id: productId },
    data: {
      title: data.title,
      description: data.description === "" ? null : data.description,
      image: data.image === "" ? null : data.image,
      url: data.url,
      ctaText: data.ctaText === "" ? null : data.ctaText,
      featured: data.featured,
    },
  });
}

export async function deleteProduct(userId: string, storefrontId: string, productId: string) {
  const product = await getOwnedProduct(userId, storefrontId, productId);
  if (!product) throw new Error("Product not found");
  return prisma.productCard.update({
    where: { id: productId },
    data: { deletedAt: new Date() },
  });
}

export async function duplicateProduct(
  userId: string,
  storefrontId: string,
  productId: string,
) {
  const product = await getOwnedProduct(userId, storefrontId, productId);
  if (!product) throw new Error("Product not found");

  const maxOrder = await prisma.productCard.aggregate({
    where: { storefrontId, deletedAt: null },
    _max: { order: true },
  });

  return prisma.productCard.create({
    data: {
      storefrontId,
      title: `${product.title} (copy)`,
      description: product.description,
      image: product.image,
      url: product.url,
      ctaText: product.ctaText,
      featured: product.featured,
      order: (maxOrder._max.order ?? product.order) + 1,
    },
  });
}

export async function reorderProducts(userId: string, storefrontId: string, input: unknown) {
  const parsed = reorderProductsSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid reorder data");
  const storefront = await getStorefront(userId, storefrontId);
  if (!storefront) throw new Error("Storefront not found");

  const owned = await prisma.productCard.findMany({
    where: { storefrontId, deletedAt: null },
    select: { id: true },
  });
  const ownedIds = new Set(owned.map((p) => p.id));
  const ordered = parsed.data.ids.filter((id) => ownedIds.has(id));

  await prisma.$transaction(
    ordered.map((id, index) =>
      prisma.productCard.update({ where: { id }, data: { order: index } }),
    ),
  );
  return { ok: true };
}

export async function bulkProductAction(
  userId: string,
  storefrontId: string,
  input: unknown,
) {
  const parsed = productBulkSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid request");
  const { action, ids } = parsed.data;
  const storefront = await getStorefront(userId, storefrontId);
  if (!storefront) throw new Error("Storefront not found");

  const owned = await prisma.productCard.findMany({
    where: { storefrontId, deletedAt: null, id: { in: ids } },
    select: { id: true },
  });
  if (owned.length === 0) return { count: 0 };

  if (action === "delete") {
    const res = await prisma.productCard.updateMany({
      where: { id: { in: owned.map((p) => p.id) } },
      data: { deletedAt: new Date() },
    });
    return { count: res.count };
  }
  if (action === "feature" || action === "unfeature") {
    const res = await prisma.productCard.updateMany({
      where: { id: { in: owned.map((p) => p.id) } },
      data: { featured: action === "feature" },
    });
    return { count: res.count };
  }
  return { count: 0 };
}

async function getOwnedProduct(userId: string, storefrontId: string, productId: string) {
  const storefront = await getStorefront(userId, storefrontId);
  if (!storefront) return null;
  return prisma.productCard.findFirst({
    where: { id: productId, storefrontId, deletedAt: null },
  });
}
