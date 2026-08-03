import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { setFavorite } from "@/server/links";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/links/[id]/favorite">,
) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();

  const { id } = await ctx.params;
  const body = (await request.json().catch(() => ({}))) as { favorite?: boolean };

  try {
    const result = await setFavorite(user.id, id, body.favorite ?? true);
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update favorite";
    return Response.json({ error: message }, { status: 400 });
  }
}