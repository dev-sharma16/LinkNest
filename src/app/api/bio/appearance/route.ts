import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { updateAppearance } from "@/server/bio-profiles";

export async function PATCH(request: Request) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  try {
    const profile = await updateAppearance(user.id, body);
    return Response.json({ ok: true, appearance: profile.appearance });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save theme";
    return Response.json({ error: message }, { status: 400 });
  }
}