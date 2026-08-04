import { prisma } from "@/lib/prisma";
import { socialLinksSchema, socialLinkSchema } from "@/lib/validations/bio";

export async function listSocials(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return [];
  return prisma.socialLink.findMany({
    where: { profileId: profile.id },
    orderBy: { order: "asc" },
  });
}

export async function addSocial(userId: string, input: unknown) {
  const parsed = socialLinkSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid social link");
  }
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) throw new Error("Create your profile first");

  const maxOrder = await prisma.socialLink.aggregate({
    where: { profileId: profile.id },
    _max: { order: true },
  });

  return prisma.socialLink.create({
    data: {
      profileId: profile.id,
      platform: parsed.data.platform,
      url: parsed.data.url,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });
}

export async function updateSocial(userId: string, socialId: string, input: unknown) {
  const parsed = socialLinkSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid social link");
  }
  const social = await getOwnedSocial(userId, socialId);
  if (!social) throw new Error("Social link not found");
  return prisma.socialLink.update({
    where: { id: socialId },
    data: { platform: parsed.data.platform, url: parsed.data.url },
  });
}

export async function removeSocial(userId: string, socialId: string) {
  const social = await getOwnedSocial(userId, socialId);
  if (!social) throw new Error("Social link not found");
  return prisma.socialLink.delete({ where: { id: socialId } });
}

export async function replaceSocials(userId: string, input: unknown) {
  const parsed = socialLinksSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid social links");
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) throw new Error("Create your profile first");

  await prisma.socialLink.deleteMany({ where: { profileId: profile.id } });
  if (parsed.data.items.length) {
    await prisma.socialLink.createMany({
      data: parsed.data.items.map((item, index) => ({
        profileId: profile.id,
        platform: item.platform,
        url: item.url,
        order: index,
      })),
    });
  }
  return listSocials(userId);
}

async function getOwnedSocial(userId: string, socialId: string) {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return null;
  return prisma.socialLink.findFirst({
    where: { id: socialId, profileId: profile.id },
  });
}