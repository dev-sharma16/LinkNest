import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { listProducts, createProduct } from "@/server/storefront-products";

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const { id } = await ctx.params;
  return Response.json(await listProducts(user.id, id));
}

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const { id } = await ctx.params;
  try {
    const product = await createProduct(user.id, id, await request.json());
    return Response.json(product, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create product";
    return Response.json({ error: message }, { status: 400 });
  }
}
