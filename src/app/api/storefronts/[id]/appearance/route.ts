import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { updateStorefrontAppearance } from "@/server/storefronts";

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const { id } = await ctx.params;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  try {
    const storefront = await updateStorefrontAppearance(user.id, id, body);
    return Response.json({ ok: true, appearance: storefront.appearance });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save theme";
    return Response.json({ error: message }, { status: 400 });
  }
}
