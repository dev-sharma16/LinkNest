import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { listFolders, createFolder } from "@/server/folders";

export async function GET() {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const folders = await listFolders(user.id);
  return Response.json(folders);
}

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();

  try {
    const folder = await createFolder(user.id, await request.json());
    return Response.json(folder, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create folder";
    return Response.json({ error: message }, { status: 400 });
  }
}