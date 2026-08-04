import { getImageKitSignature, imagekitEnabled } from "@/lib/imagekit";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const folder = url.searchParams.get("folder") ?? "linknest";
  if (!imagekitEnabled()) {
    return Response.json({ configured: false }, { status: 200 });
  }
  const signature = getImageKitSignature(folder);
  return Response.json({ configured: true, ...signature });
}