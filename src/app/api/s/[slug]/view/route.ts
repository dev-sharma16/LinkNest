import { getStorefrontIdBySlug } from "@/server/storefronts";
import { recordStorefrontView } from "@/server/storefront-analytics";

export async function POST(
  request: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const storefrontId = await getStorefrontIdBySlug(slug);
  if (!storefrontId) {
    return Response.json({ error: "Storefront not found" }, { status: 404 });
  }
  await recordStorefrontView(storefrontId, request);
  return Response.json({ ok: true });
}
