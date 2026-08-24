import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  createTemplateSchema,
  updateTemplateSchema,
  type TemplateType,
} from "@/lib/validations/templates";

export async function listSavedTemplates(userId: string, type: TemplateType) {
  return prisma.savedTemplate.findMany({
    where: { userId, type },
    orderBy: { updatedAt: "desc" },
  });
}

export async function listSavedTemplatesBySource(
  userId: string,
  type: TemplateType,
  source?: "manual" | "ai",
) {
  return prisma.savedTemplate.findMany({
    where: { userId, type, ...(source ? { source } : {}) },
    orderBy: { updatedAt: "desc" },
  });
}

function isDuplicateName(error: unknown): boolean {
  return (error as { code?: string })?.code === "P2002";
}

export async function createSavedTemplate(userId: string, input: unknown) {
  const parsed = createTemplateSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid template");
  }
  try {
    return await prisma.savedTemplate.create({
      data: {
        userId,
        name: parsed.data.name,
        description: parsed.data.description || null,
        type: parsed.data.type,
        source: parsed.data.source,
        compatibility: parsed.data.compatibility,
        appearance: parsed.data.appearance as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    if (isDuplicateName(error)) {
      throw new Error("You already have a template with this name");
    }
    throw error;
  }
}

export async function updateSavedTemplate(
  userId: string,
  id: string,
  input: unknown,
) {
  const parsed = updateTemplateSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid template");
  }
  const existing = await prisma.savedTemplate.findFirst({
    where: { id, userId },
  });
  if (!existing) throw new Error("Template not found");

  try {
    return await prisma.savedTemplate.update({
      where: { id },
      data: {
        ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
        ...(parsed.data.description !== undefined
          ? { description: parsed.data.description || null }
          : {}),
        ...(parsed.data.source !== undefined ? { source: parsed.data.source } : {}),
        ...(parsed.data.compatibility !== undefined
          ? { compatibility: parsed.data.compatibility }
          : {}),
        ...(parsed.data.appearance !== undefined
          ? { appearance: parsed.data.appearance as Prisma.InputJsonValue }
          : {}),
      },
    });
  } catch (error) {
    if (isDuplicateName(error)) {
      throw new Error("You already have a template with this name");
    }
    throw error;
  }
}

export async function deleteSavedTemplate(userId: string, id: string) {
  const existing = await prisma.savedTemplate.findFirst({
    where: { id, userId },
  });
  if (!existing) throw new Error("Template not found");
  return prisma.savedTemplate.delete({ where: { id } });
}

export async function duplicateSavedTemplate(userId: string, id: string) {
  const existing = await prisma.savedTemplate.findFirst({
    where: { id, userId },
  });
  if (!existing) throw new Error("Template not found");

  const newName = `${existing.name} — Copy`;
  try {
    return await prisma.savedTemplate.create({
      data: {
        userId,
        name: newName,
        description: existing.description,
        type: existing.type,
        source: existing.source,
        compatibility: existing.compatibility,
        appearance: existing.appearance as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    if (isDuplicateName(error)) {
      throw new Error("You already have a template with this name");
    }
    throw error;
  }
}
