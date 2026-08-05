import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { updateProduct, deleteProduct } from "@/server/storefront-products";

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string; productId: string }> },
) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const { id, productId } = await ctx.params;
  try {
    const product = await updateProduct(user.id, id, productId, await request.json());
    return Response.json(product);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update product";
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  ctx: { params: Promise<{ id: string; productId: string }> },
) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const { id, productId } = await ctx.params;
  try {
    await deleteProduct(user.id, id, productId);
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete product";
    return Response.json({ error: message }, { status: 400 });
  }
}
