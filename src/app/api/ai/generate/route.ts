import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { createGeneration } from "@/server/ai";
import { generateBioSchema, generateStorefrontSchema } from "@/lib/validations/ai";
import { checkAIRateLimit, getRateLimitHeaders } from "@/lib/ai/rate-limit";
import { classifyURL } from "@/lib/ai/url-classifier";

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
    const targetType = body.targetType as string;

    let validated;
    if (targetType === "bio") {
      validated = generateBioSchema.safeParse(body);
    } else if (targetType === "storefront") {
      validated = generateStorefrontSchema.safeParse(body);
    } else {
      return Response.json({ error: "targetType must be 'bio' or 'storefront'" }, { status: 400 });
    }

    if (!validated.success) {
      return Response.json(
        { error: validated.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const data = validated.data;
    const urlClassifications = (data.referenceURLs ?? []).map(classifyURL);

    const generation = await createGeneration(user.id, {
      targetType: targetType as "bio" | "storefront",
      prompt: data.prompt,
      useCase: "useCase" in data ? (data.useCase as string | undefined) : undefined,
      referenceURLs: data.referenceURLs,
      referenceImages: "referenceImages" in data ? (data.referenceImages as string[] | undefined) : undefined,
    });

    return Response.json(
      {
        id: generation.id,
        status: generation.status,
        urlClassifications,
      },
      {
        status: 201,
        headers: getRateLimitHeaders(rateLimit),
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create generation";
    return Response.json({ error: message }, { status: 400 });
  }
}
