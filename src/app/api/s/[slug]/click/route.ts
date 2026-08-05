import { prisma } from "@/lib/prisma";
import { getStorefrontIdBySlug } from "@/server/storefronts";
import { recordStorefrontClick } from "@/server/storefront-analytics";
import { redirect } from "next/navigation";

export async function GET(
  request: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const url = new URL(request.url);
  const productId = url.searchParams.get("product");

  const storefrontId = await getStorefrontIdBySlug(slug);
  if (!storefrontId) {
    return Response.json({ error: "Storefront not found" }, { status: 404 });
  }

  if (productId) {
    const product = await prisma.productCard.findFirst({
      where: { id: productId, storefrontId, deletedAt: null },
      select: { id: true, url: true },
    });
    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }
    await recordStorefrontClick(storefrontId, product.id, request);
    if (product.url && /^https?:\/\//i.test(product.url)) {
      redirect(product.url);
    }
  }
  return Response.json({ ok: true });
}
