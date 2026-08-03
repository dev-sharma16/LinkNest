import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { deleteCustomDomain } from "@/server/domains";

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/custom-domains/[id]">,
) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();

  const { id } = await ctx.params;
  try {
    await deleteCustomDomain(user.id, id);
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to remove domain";
    return Response.json({ error: message }, { status: 400 });
  }
}