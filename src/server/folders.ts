import { prisma } from "@/lib/prisma";
import {
  createFolderSchema,
  createTagSchema,
} from "@/lib/validations/links";

export async function listFolders(userId: string) {
  return prisma.folder.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { links: true } } },
  });
}

export async function createFolder(userId: string, input: unknown) {
  const parsed = createFolderSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid folder name");
  }
  return prisma.folder.create({
    data: { name: parsed.data.name.trim(), userId },
  });
}

export async function updateFolder(userId: string, id: string, input: unknown) {
  const parsed = createFolderSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid folder name");
  }
  const folder = await prisma.folder.findFirst({ where: { id, userId } });
  if (!folder) throw new Error("Folder not found");
  return prisma.folder.update({
    where: { id },
    data: { name: parsed.data.name.trim() },
  });
}

export async function deleteFolder(userId: string, id: string) {
  const folder = await prisma.folder.findFirst({ where: { id, userId } });
  if (!folder) throw new Error("Folder not found");
  return prisma.folder.delete({ where: { id } });
}

export async function listTags(userId: string) {
  return prisma.tag.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    include: { _count: { select: { links: true } } },
  });
}

export async function createTag(userId: string, input: unknown) {
  const parsed = createTagSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid tag name");
  }
  return prisma.tag.create({
    data: { name: parsed.data.name.trim(), userId },
  });
}

export async function deleteTag(userId: string, id: string) {
  const tag = await prisma.tag.findFirst({ where: { id, userId } });
  if (!tag) throw new Error("Tag not found");
  return prisma.tag.delete({ where: { id } });
}