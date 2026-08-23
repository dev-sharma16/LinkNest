import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { listAutomations, createAutomation } from "@/server/automations";

export async function GET() {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  return Response.json(await listAutomations(user.id));
}

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  try {
    const automation = await createAutomation(user.id, await request.json());
    return Response.json(automation, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create automation";
    return Response.json({ error: message }, { status: 400 });
  }
}