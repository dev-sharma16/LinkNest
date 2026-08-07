import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { createSavedTemplate, listSavedTemplates } from "@/server/saved-templates";
import { TEMPLATE_TYPES } from "@/lib/validations/templates";

export async function GET(request: Request) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "bio";
  if (!TEMPLATE_TYPES.includes(type as never)) {
    return Response.json({ error: "Invalid template type" }, { status: 400 });
  }
  const templates = await listSavedTemplates(user.id, type as never);
  return Response.json(templates);
}

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();

  try {
    const template = await createSavedTemplate(user.id, await request.json());
    return Response.json(template, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save template";
    return Response.json({ error: message }, { status: 400 });
  }
}
