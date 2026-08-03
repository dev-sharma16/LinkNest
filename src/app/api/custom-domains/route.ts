import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { listCustomDomains, createCustomDomain } from "@/server/domains";

export async function GET() {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const domains = await listCustomDomains(user.id);
  return Response.json(domains);
}

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();

  try {
    const domain = await createCustomDomain(user.id, await request.json());
    return Response.json(domain, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add domain";
    return Response.json({ error: message }, { status: 400 });
  }
}