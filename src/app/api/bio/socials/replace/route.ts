import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { replaceSocials } from "@/server/bio-socials";

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  try {
    return Response.json(await replaceSocials(user.id, await request.json()));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save social links";
    return Response.json({ error: message }, { status: 400 });
  }
}