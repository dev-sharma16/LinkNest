import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { setArchived } from "@/server/links";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/links/[id]/archive">,
) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();

  const { id } = await ctx.params;
  const body = (await request.json().catch(() => ({}))) as { archived?: boolean };

  try {
    const result = await setArchived(user.id, [id], body.archived ?? true);
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update link";
    return Response.json({ error: message }, { status: 400 });
  }
}