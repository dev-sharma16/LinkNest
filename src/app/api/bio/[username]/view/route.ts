import { prisma } from "@/lib/prisma";
import { recordBioView } from "@/server/bio-analytics";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/bio/[username]/view">,
) {
  const { username } = await ctx.params;
  const profile = await prisma.profile.findFirst({
    where: { username, published: true, visibility: "public", deletedAt: null },
    select: { id: true },
  });
  if (!profile) return Response.json({ error: "Profile not found" }, { status: 404 });

  await recordBioView(profile.id, request);
  return Response.json({ ok: true });
}