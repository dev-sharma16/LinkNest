import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { getGeneration } from "@/server/ai";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await context.params;
    const generation = await getGeneration(user.id, id);

    if (generation.status !== "completed") {
      return Response.json(
        { error: "Generation is not completed yet" },
        { status: 400 },
      );
    }

    const result = generation.result as Record<string, unknown> | null;
    const designSpec = generation.designSpec as Record<string, unknown> | null;

    return Response.json({
      id: generation.id,
      targetType: generation.targetType,
      status: generation.status,
      result,
      designSpec,
      createdAt: generation.createdAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get preview";
    return Response.json({ error: message }, { status: 404 });
  }
}
