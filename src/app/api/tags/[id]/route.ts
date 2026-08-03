import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { deleteTag } from "@/server/folders";

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/tags/[id]">,
) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();

  const { id } = await ctx.params;
  try {
    await deleteTag(user.id, id);
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete tag";
    return Response.json({ error: message }, { status: 400 });
  }
}