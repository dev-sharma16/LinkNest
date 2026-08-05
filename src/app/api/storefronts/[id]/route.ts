import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { getStorefront, updateStorefront, deleteStorefront } from "@/server/storefronts";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const { id } = await ctx.params;
  const storefront = await getStorefront(user.id, id);
  if (!storefront) return Response.json({ error: "Storefront not found" }, { status: 404 });
  return Response.json(storefront);
}

export async function PATCH(request: Request, ctx: Ctx) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const { id } = await ctx.params;
  try {
    const storefront = await updateStorefront(user.id, id, await request.json());
    return Response.json(storefront);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update storefront";
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const { id } = await ctx.params;
  try {
    await deleteStorefront(user.id, id);
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete storefront";
    return Response.json({ error: message }, { status: 400 });
  }
}
