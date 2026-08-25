import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { getGeneration, cancelGeneration, deleteGeneration } from "@/server/ai";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await context.params;
    const generation = await getGeneration(user.id, id);
    return Response.json(generation);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get generation";
    return Response.json({ error: message }, { status: 404 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await context.params;
    const body = await request.json();

    if (body.action === "cancel") {
      const generation = await cancelGeneration(user.id, id);
      return Response.json(generation);
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update generation";
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await context.params;
    await deleteGeneration(user.id, id);
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete generation";
    return Response.json({ error: message }, { status: 400 });
  }
}
