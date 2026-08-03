import { prisma } from "@/lib/prisma";
import { createUtmTemplateSchema } from "@/lib/validations/links";

export async function listUtmTemplates(userId: string) {
  return prisma.uTMTemplate.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createUtmTemplate(userId: string, input: unknown) {
  const parsed = createUtmTemplateSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid template");
  }
  const data = parsed.data;
  return prisma.uTMTemplate.create({
    data: {
      name: data.name.trim(),
      userId,
      source: data.source || null,
      medium: data.medium || null,
      campaign: data.campaign || null,
      term: data.term || null,
      content: data.content || null,
    },
  });
}

export async function deleteUtmTemplate(userId: string, id: string) {
  const template = await prisma.uTMTemplate.findFirst({
    where: { id, userId },
  });
  if (!template) throw new Error("Template not found");
  return prisma.uTMTemplate.delete({ where: { id } });
}