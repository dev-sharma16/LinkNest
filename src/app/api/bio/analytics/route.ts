import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { getBioAnalytics, type Range } from "@/server/bio-analytics";

const VALID = new Set(["24h", "7d", "30d", "all"]);

export async function GET(request: Request) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const url = new URL(request.url);
  const range = (url.searchParams.get("range") ?? "7d") as Range;
  const resolved = VALID.has(range) ? range : "7d";
  return Response.json(await getBioAnalytics(user.id, resolved));
}