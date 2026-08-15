import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { getAutomationAnalyticsForAutomation } from "@/server/automation-analytics";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, ctx: Ctx) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const { id } = await ctx.params;
  const { searchParams } = new URL(request.url);
  const range = (searchParams.get("range") ?? "7d") as
    | "24h"
    | "7d"
    | "30d"
    | "all";
  return Response.json(await getAutomationAnalyticsForAutomation(user.id, id, range));
}