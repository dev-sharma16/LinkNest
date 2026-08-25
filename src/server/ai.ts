import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { AIGenerationStatus, AIGenerationTargetType } from "@/lib/ai/types";
import type { GenerationQueryValues } from "@/lib/validations/ai";

export type GenerationListQuery = GenerationQueryValues;

export async function createGeneration(
  userId: string,
  input: {
    targetType: AIGenerationTargetType;
    prompt: string;
    useCase?: string;
    referenceURLs?: string[];
    referenceImages?: string[];
  },
) {
  return prisma.aIGeneration.create({
    data: {
      userId,
      targetType: input.targetType,
      prompt: input.prompt,
      useCase: input.useCase ?? null,
      status: "pending",
      referenceMeta: {
        urls: input.referenceURLs ?? [],
        images: input.referenceImages ?? [],
      } satisfies Prisma.InputJsonValue,
    },
  });
}

export async function updateGeneration(
  userId: string,
  generationId: string,
  update: {
    status?: AIGenerationStatus;
    designSpec?: Prisma.InputJsonValue;
    result?: Prisma.InputJsonValue;
    error?: string;
    provider?: string;
    model?: string;
    inputTokens?: number;
    outputTokens?: number;
    estimatedCost?: number;
  },
) {
  const generation = await prisma.aIGeneration.findFirst({
    where: { id: generationId, userId },
  });

  if (!generation) {
    throw new Error("Generation not found");
  }

  return prisma.aIGeneration.update({
    where: { id: generationId },
    data: update,
  });
}

export async function getGeneration(userId: string, generationId: string) {
  const generation = await prisma.aIGeneration.findFirst({
    where: { id: generationId, userId },
  });

  if (!generation) {
    throw new Error("Generation not found");
  }

  return generation;
}

export async function listGenerations(
  userId: string,
  query: GenerationListQuery = { page: 1, pageSize: 10 },
) {
  const { page, pageSize, targetType, status } = query;

  const where: Prisma.AIGenerationWhereInput = {
    userId,
    ...(targetType && { targetType }),
    ...(status && { status }),
  };

  const [items, total] = await Promise.all([
    prisma.aIGeneration.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.aIGeneration.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function cancelGeneration(userId: string, generationId: string) {
  const generation = await prisma.aIGeneration.findFirst({
    where: {
      id: generationId,
      userId,
      status: { in: ["pending", "processing"] },
    },
  });

  if (!generation) {
    throw new Error("Generation not found or cannot be cancelled");
  }

  return prisma.aIGeneration.update({
    where: { id: generationId },
    data: { status: "cancelled" },
  });
}

export async function deleteGeneration(userId: string, generationId: string) {
  const generation = await prisma.aIGeneration.findFirst({
    where: { id: generationId, userId },
  });

  if (!generation) {
    throw new Error("Generation not found");
  }

  return prisma.aIGeneration.update({
    where: { id: generationId },
    data: { deletedAt: new Date() },
  });
}
