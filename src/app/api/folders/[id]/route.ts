import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { updateFolder, deleteFolder } from "@/server/folders";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/folders/[id]">,
) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();

  const { id } = await ctx.params;
  try {
    const folder = await updateFolder(user.id, id, await request.json());
    return Response.json(folder);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update folder";
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/folders/[id]">,
) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();

  const { id } = await ctx.params;
  try {
    await deleteFolder(user.id, id);
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete folder";
    return Response.json({ error: message }, { status: 400 });
  }
}