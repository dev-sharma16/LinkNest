import { prisma } from "@/lib/prisma";
import { parseUserAgent, getClientIp, hashIp, referrerHost, lookupGeo } from "@/lib/tracking";
import type { AggEntry, Range } from "@/lib/analytics";
import { RANGE_OPTIONS } from "@/lib/analytics";

export { RANGE_OPTIONS };
export type { Range };

export async function getProfileIdForUsername(username: string) {
  const profile = await prisma.profile.findFirst({
    where: { username, published: true, visibility: "public", deletedAt: null },
    select: { id: true },
  });
  return profile?.id ?? null;
}

async function resolveProfileByUser(userId: string) {
  return prisma.profile.findUnique({ where: { userId }, select: { id: true } });
}

export async function recordBioView(profileId: string, request: Request) {
  const ua = parseUserAgent(request.headers.get("user-agent"));
  const ip = getClientIp(request.headers);
  const event = await prisma.bioEvent.create({
    data: {
      profileId,
      eventType: "view",
      ipHash: ip ? hashIp(ip) : null,
      browser: ua.browser,
      os: ua.os,
      device: ua.device,
      referrer: referrerHost(request.headers.get("referer")),
      language: request.headers.get("accept-language")?.slice(0, 10) ?? null,
    },
  });
  if (ip && !isPrivateIp(ip)) {
    void lookupGeo(ip).then(async (geo) => {
      if (!geo.country && !geo.city) return;
      await prisma.bioEvent
        .update({
          where: { id: event.id },
          data: { country: geo.country ?? null, city: geo.city ?? null },
        })
        .catch(() => undefined);
    });
  }
  return event;
}

export async function recordBioClick(
  profileId: string,
  blockId: string,
  request: Request,
) {
  const ua = parseUserAgent(request.headers.get("user-agent"));
  const ip = getClientIp(request.headers);
  const event = await prisma.bioEvent.create({
    data: {
      profileId,
      blockId,
      eventType: "click",
      ipHash: ip ? hashIp(ip) : null,
      browser: ua.browser,
      os: ua.os,
      device: ua.device,
      referrer: referrerHost(request.headers.get("referer")),
      language: request.headers.get("accept-language")?.slice(0, 10) ?? null,
    },
  });
  if (ip && !isPrivateIp(ip)) {
    void lookupGeo(ip).then(async (geo) => {
      if (!geo.country && !geo.city) return;
      await prisma.bioEvent
        .update({
          where: { id: event.id },
          data: { country: geo.country ?? null, city: geo.city ?? null },
        })
        .catch(() => undefined);
    });
  }
  return event;
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

function groupField<K extends string>(
  rows: Record<K, string | null>[],
  fieldName: K,
): AggEntry[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = row[fieldName] ?? "Unknown";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);
}

function rangeStart(range: Range): Date | null {
  if (range === "all") return null;
  const ms: Record<Exclude<Range, "all">, number> = {
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
  };
  return new Date(Date.now() - ms[range]);
}

function buildTimeline(times: Date[], range: Range) {
  const isHourly = range === "24h";
  const fmt = new Intl.DateTimeFormat("en-CA", {
    ...(isHourly
      ? { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit" }
      : { year: "numeric", month: "2-digit", day: "2-digit" }),
  });
  const buckets = new Map<string, number>();
  for (const t of times) {
    const key = fmt.format(new Date(t));
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  const step = isHourly ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const count = isHourly ? 24 : range === "7d" ? 7 : 30;
  const now = Date.now();
  const result: { date: string; clicks: number }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now - i * step);
    if (isHourly) d.setMinutes(0, 0, 0);
    result.push({ date: fmt.format(d), clicks: buckets.get(fmt.format(d)) ?? 0 });
  }
  return result;
}

export type BioAnalytics = {
  totalViews: number;
  totalClicks: number;
  uniqueVisitors: number;
  topBlocks: { id: string; label: string; count: number }[];
  timeline: { date: string; clicks: number }[];
  devices: AggEntry[];
  browsers: AggEntry[];
  countries: AggEntry[];
  referrers: AggEntry[];
  recentActivity: {
    id: string;
    eventType: string;
    blockId: string | null;
    country: string | null;
    device: string | null;
    createdAt: Date;
  }[];
};

export async function getBioAnalytics(userId: string, range: Range = "7d"): Promise<BioAnalytics> {
  const profile = await resolveProfileByUser(userId);
  if (!profile) return emptyAnalytics();

  const start = rangeStart(range);
  const where = {
    profileId: profile.id,
    ...(start ? { createdAt: { gte: start } } : {}),
  };

  const [totalViews, totalClicks, ipRows, timelineRows, deviceRows, browserRows, countryRows, referrerRows, activityRows] =
    await Promise.all([
      prisma.bioEvent.count({ where: { ...where, eventType: "view" } }),
      prisma.bioEvent.count({ where: { ...where, eventType: "click" } }),
      prisma.bioEvent.findMany({ where, select: { ipHash: true } }),
      prisma.bioEvent.findMany({ where, select: { createdAt: true } }),
      prisma.bioEvent.findMany({ where, select: { device: true } }),
      prisma.bioEvent.findMany({ where, select: { browser: true } }),
      prisma.bioEvent.findMany({ where, select: { country: true } }),
      prisma.bioEvent.findMany({ where, select: { referrer: true } }),
      prisma.bioEvent.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          eventType: true,
          blockId: true,
          country: true,
          device: true,
          createdAt: true,
        },
      }),
    ]);

  const clickRows = await prisma.bioEvent.findMany({
    where: { ...where, eventType: "click" },
    select: { blockId: true },
  });
  const blockIds = [...new Set(clickRows.map((r) => r.blockId).filter(Boolean) as string[])];
  const blocks = blockIds.length
    ? await prisma.bioBlock.findMany({
        where: { id: { in: blockIds } },
        select: { id: true, type: true, config: true },
      })
    : [];
  const labelOf = new Map(
    blocks.map((b) => [b.id, blockLabel(b.type, (b.config ?? {}) as Record<string, unknown>)]),
  );
  const topMap = new Map<string, number>();
  for (const r of clickRows) {
    if (!r.blockId) continue;
    topMap.set(r.blockId, (topMap.get(r.blockId) ?? 0) + 1);
  }
  const topBlocks = [...topMap.entries()]
    .map(([id, count]) => ({
      id,
      label: labelOf.get(id) ?? "Unknown block",
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalViews,
    totalClicks,
    uniqueVisitors: new Set(ipRows.map((r) => r.ipHash).filter(Boolean)).size,
    topBlocks,
    timeline: buildTimeline(timelineRows.map((r) => r.createdAt), range),
    devices: groupField(deviceRows, "device"),
    browsers: groupField(browserRows, "browser"),
    countries: groupField(countryRows, "country"),
    referrers: groupField(referrerRows, "referrer"),
    recentActivity: activityRows,
  };
}

function blockLabel(type: string, config: Record<string, unknown>): string {
  if (typeof config.label === "string" && config.label) return config.label;
  if (typeof config.title === "string" && config.title) return config.title;
  if (typeof config.content === "string") {
    return (config.content as string).slice(0, 40);
  }
  return type.replace("_", " ");
}

function emptyAnalytics(): BioAnalytics {
  return {
    totalViews: 0,
    totalClicks: 0,
    uniqueVisitors: 0,
    topBlocks: [],
    timeline: [],
    devices: [],
    browsers: [],
    countries: [],
    referrers: [],
    recentActivity: [],
  };
}