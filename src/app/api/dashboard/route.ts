import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { getDashboardData, type Range } from "@/server/analytics";

const VALID_RANGES = new Set(["24h", "7d", "30d", "all"]);

export async function GET(request: Request) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();

  const url = new URL(request.url);
  const range = (url.searchParams.get("range") ?? "7d") as Range;
  const resolved = VALID_RANGES.has(range) ? range : "7d";

  const data = await getDashboardData(user.id, resolved);
  return Response.json(data);
}