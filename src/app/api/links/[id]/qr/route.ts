import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { getLinkForUser } from "@/server/links";
import { updateQrConfig } from "@/server/qr";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/links/[id]/qr">,
) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();

  const { id } = await ctx.params;
  const link = await getLinkForUser(user.id, id);
  if (!link) return Response.json({ error: "Link not found" }, { status: 404 });

  try {
    const body = (await request.json()) as {
      fgColor?: string;
      bgColor?: string;
      size?: number;
    };
    const qr = await updateQrConfig(id, body);
    return Response.json(qr);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update QR";
    return Response.json({ error: message }, { status: 400 });
  }
}