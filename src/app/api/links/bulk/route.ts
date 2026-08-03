import { z } from "zod";
import { getApiUser, unauthorizedResponse } from "@/server/auth";
import {
  deleteLinks,
  restoreLinks,
  setArchived,
} from "@/server/links";

const bulkSchema = z.object({
  action: z.enum(["delete", "archive", "unarchive", "restore"]),
  ids: z.array(z.string().uuid()).min(1).max(500),
});

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();

  const parsed = bulkSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { action, ids } = parsed.data;

  try {
    switch (action) {
      case "delete":
        return Response.json(await deleteLinks(user.id, ids));
      case "restore":
        return Response.json(await restoreLinks(user.id, ids));
      case "archive":
        return Response.json(await setArchived(user.id, ids, true));
      case "unarchive":
        return Response.json(await setArchived(user.id, ids, false));
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Operation failed";
    return Response.json({ error: message }, { status: 400 });
  }
}