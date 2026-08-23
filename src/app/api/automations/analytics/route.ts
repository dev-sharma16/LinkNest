import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { getAutomationAnalytics } from "@/server/automation-analytics";

export async function GET(request: Request) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const { searchParams } = new URL(request.url);
  const range = (searchParams.get("range") ?? "7d") as
    | "24h"
    | "7d"
    | "30d"
    | "all";
  return Response.json(await getAutomationAnalytics(user.id, range));
}