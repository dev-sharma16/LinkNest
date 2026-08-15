import { prisma } from "@/lib/prisma";
import { socialAccountConnectSchema } from "@/lib/validations/automations";

export async function listSocialAccounts(userId: string) {
  return prisma.socialAccount.findMany({
    where: { userId, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSocialAccount(userId: string, accountId: string) {
  return prisma.socialAccount.findFirst({
    where: { id: accountId, userId, deletedAt: null },
  });
}

export async function connectSocialAccount(userId: string, input: unknown) {
  const parsed = socialAccountConnectSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid account data");
  }
  const d = parsed.data;

  const existing = await prisma.socialAccount.findUnique({
    where: {
      platform_platformUserId: {
        platform: d.platform,
        platformUserId: d.platformUserId,
      },
    },
  });

  // A soft-deleted account is reused by re-activating it instead of creating
  // a duplicate (the composite key must stay unique).
  const data = {
    username: d.username,
    displayName: d.displayName || null,
    accessToken: d.accessToken,
    refreshToken: d.refreshToken || null,
    tokenExpiresAt: d.tokenExpiresAt
      ? new Date(d.tokenExpiresAt)
      : null,
    scope: d.scope || null,
    email: d.email || null,
    avatar: d.avatar || null,
    status: "connected",
  };

  if (existing) {
    if (existing.userId !== userId) throw new Error("This account is already connected");
    return prisma.socialAccount.update({
      where: { id: existing.id },
      data: { ...data, deletedAt: null },
    });
  }

  return prisma.socialAccount.create({
    data: { ...data, userId, platform: d.platform, platformUserId: d.platformUserId },
  });
}

export async function disconnectSocialAccount(
  userId: string,
  accountId: string,
) {
  const account = await getSocialAccount(userId, accountId);
  if (!account) throw new Error("Social account not found");
  return prisma.socialAccount.update({
    where: { id: accountId },
    data: { deletedAt: new Date() },
  });
}

export async function setSocialAccountStatus(
  userId: string,
  accountId: string,
  status: "connected" | "error" | "disconnected",
) {
  const account = await getSocialAccount(userId, accountId);
  if (!account) throw new Error("Social account not found");
  return prisma.socialAccount.update({ where: { id: accountId }, data: { status } });
}