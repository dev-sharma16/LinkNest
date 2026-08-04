import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { listSocials, addSocial } from "@/server/bio-socials";

export async function GET() {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  return Response.json(await listSocials(user.id));
}

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  try {
    const social = await addSocial(user.id, await request.json());
    return Response.json(social, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add social link";
    return Response.json({ error: message }, { status: 400 });
  }
}