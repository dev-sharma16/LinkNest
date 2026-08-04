import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { listLeads } from "@/server/bio-leads";

export async function GET(request: Request) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const url = new URL(request.url);
  const type = url.searchParams.get("type") ?? undefined;
  return Response.json(await listLeads(user.id, type));
}