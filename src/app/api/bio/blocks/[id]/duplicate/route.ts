import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { duplicateBlock } from "@/server/bio-blocks";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/bio/blocks/[id]/duplicate">,
) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const { id } = await ctx.params;
  try {
    const block = await duplicateBlock(user.id, id);
    return Response.json(block, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to duplicate block";
    return Response.json({ error: message }, { status: 400 });
  }
}