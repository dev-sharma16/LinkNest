import { prisma } from "@/lib/prisma";
import { contactSchema, newsletterSchema } from "@/lib/validations/bio";

export async function listLeads(userId: string, type?: string) {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return [];
  return prisma.lead.findMany({
    where: { profileId: profile.id, ...(type ? { type } : {}) },
    orderBy: { createdAt: "desc" },
    take: 500,
  });
}

export async function submitContact(username: string, input: unknown) {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid submission");
  }
  const profile = await getProfileId(username);
  if (!profile) throw new Error("Profile not found");
  if (isHoneypot(parsed.data.token)) {
    return { ok: true, spam: true };
  }
  return prisma.lead.create({
    data: {
      profileId: profile.id,
      type: "contact",
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
    },
  });
}

export async function submitNewsletter(username: string, input: unknown) {
  const parsed = newsletterSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid submission");
  }
  const profile = await getProfileId(username);
  if (!profile) throw new Error("Profile not found");
  if (isHoneypot(parsed.data.token)) {
    return { ok: true, spam: true };
  }
  const existing = await prisma.lead.findFirst({
    where: { profileId: profile.id, type: "newsletter", email: parsed.data.email },
  });
  if (existing) return { ok: true, duplicate: true };
  return prisma.lead.create({
    data: {
      profileId: profile.id,
      type: "newsletter",
      name: parsed.data.name || null,
      email: parsed.data.email,
    },
  });
}

async function getProfileId(username: string) {
  const profile = await prisma.profile.findFirst({
    where: { username, published: true, visibility: "public", deletedAt: null },
    select: { id: true },
  });
  return profile;
}

function isHoneypot(token?: string): boolean {
  return Boolean(token && token.length > 0);
}