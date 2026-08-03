import { prisma } from "@/lib/prisma";
import {
  parseUserAgent,
  getClientIp,
  hashIp,
  referrerHost,
  lookupGeo,
} from "@/lib/tracking";

export async function recordClick(linkId: string, request: Request) {
  const ua = parseUserAgent(request.headers.get("user-agent"));
  const ip = getClientIp(request.headers);

  const click = await prisma.click.create({
    data: {
      linkId,
      ipHash: ip ? hashIp(ip) : null,
      browser: ua.browser,
      os: ua.os,
      device: ua.device,
      referrer: referrerHost(request.headers.get("referer")),
      language: request.headers.get("accept-language")?.slice(0, 10) ?? null,
    },
  });

  if (ip && !isPrivateIp(ip)) {
    // Best-effort enrichment, never blocks the redirect.
    void lookupGeo(ip).then(async (geo) => {
      if (!geo.country && !geo.city) return;
      await prisma.click
        .update({
          where: { id: click.id },
          data: { country: geo.country ?? null, city: geo.city ?? null },
        })
        .catch(() => undefined);
    });
  }

  return click;
}

function isPrivateIp(ip: string): boolean {
  const normalized = ip.includes("::ffff:") ? ip.split("::ffff:")[1]! : ip;
  if (normalized === "127.0.0.1" || normalized === "::1") return true;
  return (
    /^10\./.test(normalized) ||
    /^192\.168\./.test(normalized) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(normalized)
  );
}