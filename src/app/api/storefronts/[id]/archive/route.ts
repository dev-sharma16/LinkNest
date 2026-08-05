import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { setStorefrontArchived } from "@/server/storefronts";

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const { id } = await ctx.params;
  const body = (await request.json().catch(() => ({}))) as { archived?: boolean };
  try {
    const storefront = await setStorefrontArchived(user.id, id, Boolean(body.archived));
    return Response.json(storefront);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update";
    return Response.json({ error: message }, { status: 400 });
  }
}
