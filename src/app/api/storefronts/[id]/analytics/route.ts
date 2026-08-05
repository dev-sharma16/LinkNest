import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { getStorefrontAnalytics } from "@/server/storefront-analytics";
import type { Range } from "@/lib/analytics";

export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const { id } = await ctx.params;
  const url = new URL(request.url);
  const range = (url.searchParams.get("range") ?? "7d") as Range;
  const data = await getStorefrontAnalytics(user.id, id, range);
  return Response.json(data);
}
