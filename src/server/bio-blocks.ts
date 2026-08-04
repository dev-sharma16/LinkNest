import { prisma } from "@/lib/prisma";
import {
  createBlockSchema,
  updateBlockSchema,
  reorderBlocksSchema,
  blockBulkSchema,
  type BlockType,
} from "@/lib/validations/bio";
import { getBlockMeta, normalizeBlockConfig } from "@/lib/bio-blocks";
import { Prisma } from "@/generated/prisma/client";

export async function listBlocks(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return [];
  return prisma.bioBlock.findMany({
    where: { profileId: profile.id, deletedAt: null },
    orderBy: { order: "asc" },
  });
}

export async function createBlock(userId: string, input: unknown) {
  const parsed = createBlockSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid block");
  }
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) throw new Error("Create your profile first");

  const type = parsed.data.type as BlockType;
  const config = normalizeBlockConfig(type, parsed.data.config);

  const maxOrder = await prisma.bioBlock.aggregate({
    where: { profileId: profile.id, deletedAt: null },
    _max: { order: true },
  });

  return prisma.bioBlock.create({
    data: {
      profileId: profile.id,
      type,
      order: parsed.data.order ?? (maxOrder._max.order ?? -1) + 1,
      config: config as unknown as Prisma.InputJsonValue,
    },
  });
}

export async function updateBlock(userId: string, blockId: string, input: unknown) {
  const parsed = updateBlockSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid block");
  }
  const block = await getOwnedBlock(userId, blockId);
  if (!block) throw new Error("Block not found");

  const existing = (block.config ?? {}) as Record<string, unknown>;
  const nextConfig = parsed.data.config
    ? normalizeBlockConfig(block.type as BlockType, {
        ...existing,
        ...parsed.data.config,
      })
    : undefined;

  return prisma.bioBlock.update({
    where: { id: blockId },
    data: {
      config: nextConfig as unknown as Prisma.InputJsonValue | undefined,
      hidden: parsed.data.hidden,
      scheduleStartAt: parsed.data.scheduleStartAt
        ? new Date(parsed.data.scheduleStartAt)
        : parsed.data.scheduleStartAt === ""
          ? null
          : undefined,
      scheduleEndAt: parsed.data.scheduleEndAt
        ? new Date(parsed.data.scheduleEndAt)
        : parsed.data.scheduleEndAt === ""
          ? null
          : undefined,
    },
  });
}

export async function deleteBlock(userId: string, blockId: string) {
  const block = await getOwnedBlock(userId, blockId);
  if (!block) throw new Error("Block not found");
  return prisma.bioBlock.update({
    where: { id: blockId },
    data: { deletedAt: new Date() },
  });
}

export async function duplicateBlock(userId: string, blockId: string) {
  const block = await getOwnedBlock(userId, blockId);
  if (!block) throw new Error("Block not found");

  const maxOrder = await prisma.bioBlock.aggregate({
    where: { profileId: block.profileId, deletedAt: null },
    _max: { order: true },
  });

  return prisma.bioBlock.create({
    data: {
      profileId: block.profileId,
      type: block.type,
      order: (maxOrder._max.order ?? block.order) + 1,
      config: block.config as Prisma.InputJsonValue | undefined,
      scheduleStartAt: block.scheduleStartAt,
      scheduleEndAt: block.scheduleEndAt,
    },
  });
}

export async function setBlockHidden(userId: string, blockId: string, hidden: boolean) {
  const block = await getOwnedBlock(userId, blockId);
  if (!block) throw new Error("Block not found");
  return prisma.bioBlock.update({
    where: { id: blockId },
    data: { hidden },
  });
}

export async function reorderBlocks(userId: string, input: unknown) {
  const parsed = reorderBlocksSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid reorder data");
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) throw new Error("Profile not found");

  const owned = await prisma.bioBlock.findMany({
    where: { profileId: profile.id, deletedAt: null },
    select: { id: true },
  });
  const ownedIds = new Set(owned.map((b) => b.id));
  const ordered = parsed.data.ids.filter((id) => ownedIds.has(id));

  await prisma.$transaction(
    ordered.map((id, index) =>
      prisma.bioBlock.update({ where: { id }, data: { order: index } }),
    ),
  );
  return { ok: true };
}

export async function bulkBlockAction(userId: string, input: unknown) {
  const parsed = blockBulkSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid request");
  const { action, ids } = parsed.data;

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) throw new Error("Profile not found");

  const owned = await prisma.bioBlock.findMany({
    where: { profileId: profile.id, deletedAt: null, id: { in: ids } },
    select: { id: true, type: true, config: true, order: true, scheduleStartAt: true, scheduleEndAt: true },
  });

  if (owned.length === 0) return { count: 0 };

  if (action === "hide") {
    const res = await prisma.bioBlock.updateMany({
      where: { id: { in: owned.map((b) => b.id) } },
      data: { hidden: true },
    });
    return { count: res.count };
  }
  if (action === "unhide") {
    const res = await prisma.bioBlock.updateMany({
      where: { id: { in: owned.map((b) => b.id) } },
      data: { hidden: false },
    });
    return { count: res.count };
  }
  if (action === "duplicate") {
    const maxOrder = await prisma.bioBlock.aggregate({
      where: { profileId: profile.id, deletedAt: null },
      _max: { order: true },
    });
    let order = (maxOrder._max.order ?? -1);
    for (const b of owned) {
      order += 1;
      await prisma.bioBlock.create({
        data: {
          profileId: profile.id,
          type: b.type,
          order,
          config: b.config as Prisma.InputJsonValue | undefined,
          scheduleStartAt: b.scheduleStartAt,
          scheduleEndAt: b.scheduleEndAt,
        },
      });
    }
    return { count: owned.length };
  }
  return { count: 0 };
}

async function getOwnedBlock(userId: string, blockId: string) {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return null;
  return prisma.bioBlock.findFirst({
    where: { id: blockId, profileId: profile.id, deletedAt: null },
  });
}

export { getBlockMeta };