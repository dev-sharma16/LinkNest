import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { listBlocks, createBlock } from "@/server/bio-blocks";

export async function GET() {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  return Response.json(await listBlocks(user.id));
}

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  try {
    const block = await createBlock(user.id, await request.json());
    return Response.json(block, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create block";
    return Response.json({ error: message }, { status: 400 });
  }
}