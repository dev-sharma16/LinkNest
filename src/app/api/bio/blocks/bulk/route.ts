import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { bulkBlockAction } from "@/server/bio-blocks";

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  try {
    return Response.json(await bulkBlockAction(user.id, await request.json()));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bulk action failed";
    return Response.json({ error: message }, { status: 400 });
  }
}