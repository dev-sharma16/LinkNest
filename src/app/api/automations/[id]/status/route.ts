import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { setAutomationStatus } from "@/server/automations";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const { id } = await ctx.params;
  try {
    const automation = await setAutomationStatus(user.id, id, await request.json());
    return Response.json(automation);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update status";
    return Response.json({ error: message }, { status: 400 });
  }
}