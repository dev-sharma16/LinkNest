import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { updateBlock, deleteBlock } from "@/server/bio-blocks";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/bio/blocks/[id]">,
) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const { id } = await ctx.params;
  try {
    return Response.json(await updateBlock(user.id, id, await request.json()));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update block";
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/bio/blocks/[id]">,
) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const { id } = await ctx.params;
  try {
    await deleteBlock(user.id, id);
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete block";
    return Response.json({ error: message }, { status: 400 });
  }
}