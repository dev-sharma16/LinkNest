import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { getOverviewAnalytics } from "@/server/overview-analytics";
import type { Range } from "@/lib/analytics";

const VALID_RANGES = new Set(["24h", "7d", "30d", "all"]);

export async function GET(request: Request) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();

  const url = new URL(request.url);
  const range = (url.searchParams.get("range") ?? "30d") as Range;
  const resolved = VALID_RANGES.has(range) ? range : "30d";

  const data = await getOverviewAnalytics(user.id, resolved);
  return Response.json(data);
}
