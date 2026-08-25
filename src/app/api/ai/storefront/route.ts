import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { createGeneration } from "@/server/ai";
import { generateStorefront } from "@/server/ai-builder";
import { generateStorefrontSchema } from "@/lib/validations/ai";
import { checkAIRateLimit, getRateLimitHeaders } from "@/lib/ai/rate-limit";

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();

  try {
    const rateLimit = await checkAIRateLimit(user.id);
    if (!rateLimit.allowed) {
      return Response.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429, headers: getRateLimitHeaders(rateLimit) },
      );
    }

    const body = await request.json();
    const validated = generateStorefrontSchema.safeParse(body);
    if (!validated.success) {
      return Response.json(
        { error: validated.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const data = validated.data;
    const generation = await createGeneration(user.id, {
      targetType: "storefront",
      prompt: data.prompt,
      useCase: data.useCase || undefined,
      referenceURLs: data.referenceURLs,
      referenceImages: data.referenceImages,
    });

    const result = await generateStorefront(user.id, generation.id, {
      prompt: data.prompt,
      useCase: data.useCase || undefined,
      referenceURLs: data.referenceURLs,
      referenceImages: data.referenceImages,
    });

    return Response.json(result, {
      status: 201,
      headers: getRateLimitHeaders(rateLimit),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate storefront";
    return Response.json({ error: message }, { status: 400 });
  }
}
