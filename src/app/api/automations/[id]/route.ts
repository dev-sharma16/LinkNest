import { getApiUser, unauthorizedResponse } from "@/server/auth";
import {
  getAutomation,
  updateAutomation,
  deleteAutomation,
} from "@/server/automations";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const { id } = await ctx.params;
  const automation = await getAutomation(user.id, id);
  if (!automation) return Response.json({ error: "Automation not found" }, { status: 404 });
  return Response.json(automation);
}

export async function PATCH(request: Request, ctx: Ctx) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const { id } = await ctx.params;
  try {
    const automation = await updateAutomation(user.id, id, await request.json());
    return Response.json(automation);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update automation";
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const { id } = await ctx.params;
  try {
    await deleteAutomation(user.id, id);
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete automation";
    return Response.json({ error: message }, { status: 400 });
  }
}