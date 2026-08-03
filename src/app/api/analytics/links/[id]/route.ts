import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { getLinkForUser } from "@/server/links";
import { getLinkAnalytics, type Range } from "@/server/analytics";

const VALID_RANGES = new Set(["24h", "7d", "30d", "all"]);

export async function GET(
  request: Request,
  ctx: RouteContext<"/api/analytics/links/[id]">,
) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();

  const { id } = await ctx.params;
  const url = new URL(request.url);
  const range = (url.searchParams.get("range") ?? "30d") as Range;
  const resolved = VALID_RANGES.has(range) ? range : "30d";

  const link = await getLinkForUser(user.id, id);
  if (!link) return Response.json({ error: "Link not found" }, { status: 404 });

  const analytics = await getLinkAnalytics(id, resolved);
  return Response.json(analytics);
}