import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { deleteSavedTemplate, updateSavedTemplate } from "@/server/saved-templates";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/templates/[id]">,
) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();

  const { id } = await ctx.params;
  try {
    const template = await updateSavedTemplate(user.id, id, await request.json());
    return Response.json(template);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update template";
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/templates/[id]">,
) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();

  const { id } = await ctx.params;
  try {
    await deleteSavedTemplate(user.id, id);
    return Response.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete template";
    return Response.json({ error: message }, { status: 400 });
  }
}
