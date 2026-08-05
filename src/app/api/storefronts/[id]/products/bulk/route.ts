import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { bulkProductAction } from "@/server/storefront-products";

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const { id } = await ctx.params;
  try {
    return Response.json(await bulkProductAction(user.id, id, await request.json()));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update products";
    return Response.json({ error: message }, { status: 400 });
  }
}
