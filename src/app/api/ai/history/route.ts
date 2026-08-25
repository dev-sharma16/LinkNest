import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { listGenerations } from "@/server/ai";
import { generationQuerySchema } from "@/lib/validations/ai";

export async function GET(request: Request) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    const validated = generationQuerySchema.safeParse(query);
    if (!validated.success) {
      return Response.json(
        { error: validated.error.issues[0]?.message ?? "Invalid query" },
        { status: 400 },
      );
    }

    const result = await listGenerations(user.id, validated.data);
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list generations";
    return Response.json({ error: message }, { status: 500 });
  }
}
