import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { updateSocial, removeSocial } from "@/server/bio-socials";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/bio/socials/[id]">,
) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const { id } = await ctx.params;
  try {
    return Response.json(await updateSocial(user.id, id, await request.json()));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update";
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/bio/socials/[id]">,
) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const { id } = await ctx.params;
  try {
    await removeSocial(user.id, id);
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to remove";
    return Response.json({ error: message }, { status: 400 });
  }
}