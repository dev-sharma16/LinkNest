import { Prisma } from "@/generated/prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  automationCreateSchema,
  automationUpdateSchema,
  automationStatusSchema,
} from "@/lib/validations/automations";

const automationInclude = {
  socialAccount: {
    select: {
      id: true,
      platform: true,
      username: true,
      displayName: true,
      status: true,
    },
  },
  _count: {
    select: { events: true, processedComments: true },
  },
} satisfies Prisma.CommentAutomationInclude;

function normalizeKeywords(keywords: string[]): string[] {
  return keywords
    .map((k) => k.trim().toLowerCase())
    .filter((k) => k.length > 0);
}

export async function listAutomations(userId: string) {
  return prisma.commentAutomation.findMany({
    where: { userId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: automationInclude,
  });
}

export async function getAutomation(userId: string, automationId: string) {
  const automation = await prisma.commentAutomation.findFirst({
    where: { id: automationId, userId, deletedAt: null },
    include: automationInclude,
  });
  if (!automation) return null;
  return automation;
}

export async function createAutomation(userId: string, input: unknown) {
  const parsed = automationCreateSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid automation data");
  }
  const d = parsed.data;

  const account = await prisma.socialAccount.findFirst({
    where: { id: d.socialAccountId, userId, deletedAt: null },
    select: { id: true },
  });
  if (!account) throw new Error("Social account not found");

  return prisma.commentAutomation.create({
    data: {
      userId,
      socialAccountId: d.socialAccountId,
      name: d.name,
      keywords: normalizeKeywords(d.keywords) as unknown as Prisma.InputJsonValue,
      replyMessage: d.replyMessage,
      url: d.url,
      cooldownMinutes: d.cooldownMinutes ?? 60,
      status: "draft",
    },
    include: automationInclude,
  });
}

export async function updateAutomation(
  userId: string,
  automationId: string,
  input: unknown,
) {
  const parsed = automationUpdateSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid automation data");
  }
  const d = parsed.data;
  const existing = await getOwnedAutomation(userId, automationId);
  if (!existing) throw new Error("Automation not found");

  if (d.socialAccountId) {
    const account = await prisma.socialAccount.findFirst({
      where: { id: d.socialAccountId, userId, deletedAt: null },
      select: { id: true },
    });
    if (!account) throw new Error("Social account not found");
  }

  return prisma.commentAutomation.update({
    where: { id: automationId },
    data: {
      ...(d.name !== undefined ? { name: d.name } : {}),
      ...(d.socialAccountId !== undefined
        ? { socialAccountId: d.socialAccountId }
        : {}),
      ...(d.keywords !== undefined
        ? { keywords: normalizeKeywords(d.keywords) as unknown as Prisma.InputJsonValue }
        : {}),
      ...(d.replyMessage !== undefined ? { replyMessage: d.replyMessage } : {}),
      ...(d.url !== undefined ? { url: d.url } : {}),
      ...(d.cooldownMinutes !== undefined
        ? { cooldownMinutes: d.cooldownMinutes }
        : {}),
      ...(d.status !== undefined ? { status: d.status } : {}),
    },
    include: automationInclude,
  });
}

export async function deleteAutomation(userId: string, automationId: string) {
  const existing = await getOwnedAutomation(userId, automationId);
  if (!existing) throw new Error("Automation not found");
  return prisma.commentAutomation.update({
    where: { id: automationId },
    data: { deletedAt: new Date() },
  });
}

export async function duplicateAutomation(userId: string, automationId: string) {
  const existing = await getOwnedAutomation(userId, automationId);
  if (!existing) throw new Error("Automation not found");

  return prisma.commentAutomation.create({
    data: {
      userId,
      socialAccountId: existing.socialAccountId,
      name: `${existing.name} (copy)`,
      keywords: existing.keywords as Prisma.InputJsonValue,
      replyMessage: existing.replyMessage,
      url: existing.url,
      cooldownMinutes: existing.cooldownMinutes,
      status: "draft",
    },
    include: automationInclude,
  });
}

export async function setAutomationStatus(
  userId: string,
  automationId: string,
  input: unknown,
) {
  const parsed = z
    .object({ status: automationStatusSchema })
    .safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid status");
  }
  const existing = await getOwnedAutomation(userId, automationId);
  if (!existing) throw new Error("Automation not found");
  return prisma.commentAutomation.update({
    where: { id: automationId },
    data: { status: parsed.data.status },
    include: automationInclude,
  });
}

export async function getActiveAutomationsForAccount(
  socialAccountId: string,
) {
  return prisma.commentAutomation.findMany({
    where: { socialAccountId, status: "active", deletedAt: null },
    select: {
      id: true,
      keywords: true,
      replyMessage: true,
      url: true,
      cooldownMinutes: true,
      socialAccount: { select: { accessToken: true } },
    },
  });
}

async function getOwnedAutomation(userId: string, automationId: string) {
  return prisma.commentAutomation.findFirst({
    where: { id: automationId, userId, deletedAt: null },
  });
}