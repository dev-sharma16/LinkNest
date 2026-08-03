import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { deleteUtmTemplate } from "@/server/utm-templates";

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/utm-templates/[id]">,
) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();

  const { id } = await ctx.params;
  try {
    await deleteUtmTemplate(user.id, id);
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete template";
    return Response.json({ error: message }, { status: 400 });
  }
}