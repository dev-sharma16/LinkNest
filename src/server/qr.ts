import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { APP_URL } from "@/lib/env";

export async function getOrCreateQrForLink(link: { id: string; slug: string }) {
  const existing = await prisma.qRCode.findUnique({ where: { linkId: link.id } });
  if (existing) return existing;

  try {
    return await prisma.qRCode.create({
      data: {
        linkId: link.id,
      },
    });
  } catch {
    // Concurrent create - already exists.
    const current = await prisma.qRCode.findUnique({
      where: { linkId: link.id },
    });
    if (current) return current;
    throw new Error("Could not generate QR code");
  }
}

export async function renderQr(config: {
  fgColor: string;
  bgColor: string;
  size: number;
  slug: string;
}) {
  const target = `${APP_URL}/${encodeURIComponent(config.slug)}`;
  const dataUrl = await QRCode.toDataURL(target, {
    width: config.size,
    margin: 2,
    color: {
      dark: config.fgColor,
      light: config.bgColor,
    },
    errorCorrectionLevel: "M",
  });
  return dataUrl;
}

export async function generateQrForLink(link: { id: string; slug: string }) {
  const qr = await getOrCreateQrForLink(link);
  const dataUrl = await renderQr({
    fgColor: qr.fgColor,
    bgColor: qr.bgColor,
    size: qr.size,
    slug: link.slug,
  });
  return { id: qr.id, dataUrl, fgColor: qr.fgColor, bgColor: qr.bgColor, size: qr.size };
}

export async function updateQrConfig(
  linkId: string,
  config: { fgColor?: string; bgColor?: string; size?: number },
) {
  const link = await prisma.link.findUnique({
    where: { id: linkId },
    select: { slug: true },
  });
  if (!link) throw new Error("Link not found");
  await getOrCreateQrForLink({ id: linkId, slug: link.slug });
  return prisma.qRCode.update({
    where: { linkId },
    data: {
      fgColor: config.fgColor ?? "#000000",
      bgColor: config.bgColor ?? "#ffffff",
      size: Math.min(2048, Math.max(128, config.size ?? 512)),
    },
  });
}

export async function deleteQr(linkId: string) {
  await prisma.qRCode.deleteMany({ where: { linkId } });
}