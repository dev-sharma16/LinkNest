import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { listSocialAccounts, connectSocialAccount } from "@/server/social-accounts";

export async function GET() {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  return Response.json(await listSocialAccounts(user.id));
}

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  try {
    const account = await connectSocialAccount(user.id, await request.json());
    return Response.json(account, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to connect account";
    return Response.json({ error: message }, { status: 400 });
  }
}