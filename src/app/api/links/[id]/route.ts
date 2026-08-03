import { getApiUser, unauthorizedResponse } from "@/server/auth";
import {
  getLinkForUser,
  updateLink,
  deleteLinks,
} from "@/server/links";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/links/[id]">,
) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();

  const { id } = await ctx.params;
  const link = await getLinkForUser(user.id, id);
  if (!link) return Response.json({ error: "Link not found" }, { status: 404 });
  return Response.json(link);
}

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/links/[id]">,
) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();

  const { id } = await ctx.params;
  try {
    const body = await request.json();
    const link = await updateLink(user.id, id, body);
    return Response.json(link);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update link";
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/links/[id]">,
) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();

  const { id } = await ctx.params;
  await deleteLinks(user.id, [id]);
  return Response.json({ ok: true });
}