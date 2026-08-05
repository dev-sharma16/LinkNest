import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { listStorefronts, createStorefront } from "@/server/storefronts";

export async function GET() {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  return Response.json(await listStorefronts(user.id));
}

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  try {
    const storefront = await createStorefront(user.id, await request.json());
    return Response.json(storefront, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create storefront";
    return Response.json({ error: message }, { status: 400 });
  }
}
