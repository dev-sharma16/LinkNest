import { prisma } from "@/lib/prisma";
import { createDomainSchema } from "@/lib/validations/links";

export async function listCustomDomains(userId: string) {
  return prisma.customDomain.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { links: true } } },
  });
}

export async function createCustomDomain(userId: string, input: unknown) {
  const parsed = createDomainSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid domain");
  }
  const domain = parsed.data.domain.trim().toLowerCase();
  const existing = await prisma.customDomain.findFirst({
    where: { domain },
  });
  if (existing) {
    throw new Error("That domain is already in use");
  }
  return prisma.customDomain.create({
    data: { domain, userId, verified: false },
  });
}

export async function deleteCustomDomain(userId: string, id: string) {
  const domain = await prisma.customDomain.findFirst({
    where: { id, userId },
  });
  if (!domain) throw new Error("Domain not found");

  await prisma.$transaction([
    prisma.link.updateMany({
      where: { customDomainId: id },
      data: { customDomainId: null },
    }),
    prisma.customDomain.delete({ where: { id } }),
  ]);
  return { ok: true };
}

export async function markDomainVerified(userId: string, id: string) {
  const domain = await prisma.customDomain.findFirst({
    where: { id, userId },
  });
  if (!domain) throw new Error("Domain not found");
  return prisma.customDomain.update({
    where: { id },
    data: { verified: true },
  });
}