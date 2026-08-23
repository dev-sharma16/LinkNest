import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { duplicateAutomation } from "@/server/automations";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_request: Request, ctx: Ctx) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const { id } = await ctx.params;
  try {
    const automation = await duplicateAutomation(user.id, id);
    return Response.json(automation, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to duplicate automation";
    return Response.json({ error: message }, { status: 400 });
  }
}