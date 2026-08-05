import QRCode from "qrcode";
import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { getStorefront } from "@/server/storefronts";
import { APP_URL } from "@/lib/env";

export async function GET(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const { id } = await ctx.params;

  const storefront = await getStorefront(user.id, id);
  if (!storefront) {
    return Response.json({ error: "Storefront not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const size = Math.min(2048, Math.max(128, Number(url.searchParams.get("size") ?? 512)));
  const target = `${APP_URL}/s/${encodeURIComponent(storefront.slug)}`;
  const dataUrl = await QRCode.toDataURL(target, {
    width: size,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
    errorCorrectionLevel: "M",
  });

  if (url.searchParams.get("raw") === "1") {
    const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64, "base64");
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  return Response.json({ dataUrl, target, size });
}
