import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { password } from "@/lib/password";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/unlock/[slug]">,
) {
  const { slug } = await ctx.params;
  const body = (await request.json().catch(() => ({}))) as { password?: string };

  if (!body.password) {
    return Response.json({ error: "Password is required" }, { status: 400 });
  }

  const link = await prisma.link.findFirst({
    where: { slug, deletedAt: null, passwordHash: { not: null } },
    select: { id: true, slug: true, passwordHash: true },
  });

  if (!link || !link.passwordHash) {
    return Response.json({ error: "Link not found" }, { status: 404 });
  }

  const valid = await password.verify(body.password, link.passwordHash);
  if (!valid) {
    return Response.json({ error: "Incorrect password" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(`ln_unlock_${link.slug}`, link.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return Response.json({ ok: true });
}