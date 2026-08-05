import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { duplicateStorefront } from "@/server/storefronts";

export async function POST(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const { id } = await ctx.params;
  try {
    const storefront = await duplicateStorefront(user.id, id);
    return Response.json(storefront);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to duplicate storefront";
    return Response.json({ error: message }, { status: 400 });
  }
}
