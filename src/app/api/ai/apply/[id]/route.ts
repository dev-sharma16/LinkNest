import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { applyGeneration } from "@/server/ai-builder";
import { applyGenerationSchema } from "@/lib/validations/ai";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await context.params;
    const body = await request.json();

    const validated = applyGenerationSchema.safeParse({
      ...body,
      generationId: id,
    });

    if (!validated.success) {
      return Response.json(
        { error: validated.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const result = await applyGeneration(
      user.id,
      validated.data.generationId,
      validated.data.targetType,
    );

    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to apply generation";
    return Response.json({ error: message }, { status: 400 });
  }
}
