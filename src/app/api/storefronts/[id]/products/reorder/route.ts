import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { reorderProducts } from "@/server/storefront-products";

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const { id } = await ctx.params;
  try {
    return Response.json(await reorderProducts(user.id, id, await request.json()));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reorder products";
    return Response.json({ error: message }, { status: 400 });
  }
}
