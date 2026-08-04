import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { setProfilePublished } from "@/server/bio-profiles";

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const body = (await request.json().catch(() => ({}))) as { published?: boolean };
  try {
    const profile = await setProfilePublished(user.id, Boolean(body.published));
    return Response.json(profile);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update";
    return Response.json({ error: message }, { status: 400 });
  }
}