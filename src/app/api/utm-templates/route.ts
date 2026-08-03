import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { listUtmTemplates, createUtmTemplate } from "@/server/utm-templates";

export async function GET() {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const templates = await listUtmTemplates(user.id);
  return Response.json(templates);
}

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();

  try {
    const template = await createUtmTemplate(user.id, await request.json());
    return Response.json(template, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create template";
    return Response.json({ error: message }, { status: 400 });
  }
}