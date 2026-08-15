import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { disconnectSocialAccount } from "@/server/social-accounts";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_request: Request, ctx: Ctx) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const { id } = await ctx.params;
  try {
    await disconnectSocialAccount(user.id, id);
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to disconnect account";
    return Response.json({ error: message }, { status: 400 });
  }
}