import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { getAutomationActivity } from "@/server/automation-analytics";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const { id } = await ctx.params;
  return Response.json(await getAutomationActivity(user.id, id));
}