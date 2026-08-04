import { submitNewsletter } from "@/server/bio-leads";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/bio/[username]/newsletter">,
) {
  const { username } = await ctx.params;
  try {
    const result = await submitNewsletter(username, await request.json());
    return Response.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Submission failed";
    return Response.json({ error: message }, { status: 400 });
  }
}