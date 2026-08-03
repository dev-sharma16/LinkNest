import { prisma } from "@/lib/prisma";
import { getOrCreateQrForLink, renderQr } from "@/server/qr";

export async function GET(
  request: Request,
  ctx: RouteContext<"/api/qr/[id]">,
) {
  const { id } = await ctx.params;
  const url = new URL(request.url);
  const raw = url.searchParams.get("raw") === "1";

  const link = await prisma.link.findUnique({
    where: { id },
    select: { id: true, slug: true },
  });
  if (!link) return Response.json({ error: "Link not found" }, { status: 404 });

  const qr = await getOrCreateQrForLink(link);

  const dataUrl = await renderQr({
    fgColor: qr.fgColor,
    bgColor: qr.bgColor,
    size: qr.size,
    slug: link.slug,
  });

  if (raw) {
    const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64, "base64");
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  return Response.json({
    id: qr.id,
    dataUrl,
    fgColor: qr.fgColor,
    bgColor: qr.bgColor,
    size: qr.size,
  });
}