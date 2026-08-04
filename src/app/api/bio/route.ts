import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { getOrCreateProfile, updateProfile } from "@/server/bio-profiles";

export async function GET() {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const profile = await getOrCreateProfile(user.id);
  return Response.json(profile);
}

export async function PATCH(request: Request) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  try {
    const profile = await updateProfile(user.id, await request.json());
    return Response.json(profile);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update profile";
    return Response.json({ error: message }, { status: 400 });
  }
}