import { prisma } from "@/lib/prisma";
import { recordBioClick } from "@/server/bio-analytics";
import { redirect } from "next/navigation";

export async function GET(
  request: Request,
  ctx: RouteContext<"/api/bio/[username]/click">,
) {
  const { username } = await ctx.params;
  const url = new URL(request.url);
  const blockId = url.searchParams.get("block");

  const profile = await prisma.profile.findFirst({
    where: { username, published: true, visibility: "public", deletedAt: null },
    select: { id: true },
  });
  if (!profile) return Response.json({ error: "Profile not found" }, { status: 404 });

  if (blockId) {
    const block = await prisma.bioBlock.findFirst({
      where: { id: blockId, profileId: profile.id, deletedAt: null, hidden: false },
      select: { id: true, config: true, type: true },
    });
    await recordBioClick(profile.id, blockId, request);
    if (block) {
      const config = (block.config ?? {}) as Record<string, unknown>;
      const target =
        typeof config.url === "string" && config.url
          ? config.url
          : typeof config.src === "string" && config.src
            ? config.src
            : null;
      if (target && /^https?:\/\//i.test(target)) {
        redirect(target);
      }
      redirect(url.origin);
    }
  }
  return Response.json({ ok: true });
}