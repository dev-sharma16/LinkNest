import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { listTags, createTag } from "@/server/folders";

export async function GET() {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const tags = await listTags(user.id);
  return Response.json(tags);
}

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();

  try {
    const tag = await createTag(user.id, await request.json());
    return Response.json(tag, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create tag";
    return Response.json({ error: message }, { status: 400 });
  }
}