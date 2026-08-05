import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { duplicateProduct } from "@/server/storefront-products";

export async function POST(
  _request: Request,
  ctx: { params: Promise<{ id: string; productId: string }> },
) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const { id, productId } = await ctx.params;
  try {
    const product = await duplicateProduct(user.id, id, productId);
    return Response.json(product);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to duplicate product";
    return Response.json({ error: message }, { status: 400 });
  }
}
