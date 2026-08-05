import { prisma } from "@/lib/prisma";
import { parseUserAgent, getClientIp, hashIp, referrerHost, lookupGeo } from "@/lib/tracking";
import type { AggEntry, Range } from "@/lib/analytics";
import { RANGE_OPTIONS } from "@/lib/analytics";

export { RANGE_OPTIONS };
export type { Range };

async function recordEvent(
  storefrontId: string,
  eventType: "view" | "click",
  request: Request,
  productId?: string | null,
) {
  const ua = parseUserAgent(request.headers.get("user-agent"));
  const ip = getClientIp(request.headers);
  const event = await prisma.storefrontEvent.create({
    data: {
      storefrontId,
      productId,
      eventType,
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
      await prisma.storefrontEvent
        .update({
          where: { id: event.id },
          data: { country: geo.country ?? null, city: geo.city ?? null },
        })
        .catch(() => undefined);
    });
  }
  return event;
}

export async function recordStorefrontView(storefrontId: string, request: Request) {
  return recordEvent(storefrontId, "view", request);
}

export async function recordStorefrontClick(
  storefrontId: string,
  productId: string,
  request: Request,
) {
  return recordEvent(storefrontId, "click", request, productId);
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

export type StorefrontAnalytics = {
  totalViews: number;
  totalClicks: number;
  uniqueVisitors: number;
  topProducts: { id: string; label: string; count: number }[];
  timeline: { date: string; clicks: number }[];
  devices: AggEntry[];
  browsers: AggEntry[];
  countries: AggEntry[];
  referrers: AggEntry[];
  recentActivity: {
    id: string;
    eventType: string;
    productId: string | null;
    country: string | null;
    device: string | null;
    createdAt: Date;
  }[];
};

export async function getStorefrontAnalytics(
  userId: string,
  storefrontId: string,
  range: Range = "7d",
): Promise<StorefrontAnalytics> {
  const storefront = await prisma.storefront.findFirst({
    where: { id: storefrontId, userId, deletedAt: null },
    select: { id: true },
  });
  if (!storefront) return emptyAnalytics();

  const start = rangeStart(range);
  const where = {
    storefrontId: storefront.id,
    ...(start ? { createdAt: { gte: start } } : {}),
  };

  const [totalViews, totalClicks, ipRows, timelineRows, deviceRows, browserRows, countryRows, referrerRows, activityRows] =
    await Promise.all([
      prisma.storefrontEvent.count({ where: { ...where, eventType: "view" } }),
      prisma.storefrontEvent.count({ where: { ...where, eventType: "click" } }),
      prisma.storefrontEvent.findMany({ where, select: { ipHash: true } }),
      prisma.storefrontEvent.findMany({ where, select: { createdAt: true } }),
      prisma.storefrontEvent.findMany({ where, select: { device: true } }),
      prisma.storefrontEvent.findMany({ where, select: { browser: true } }),
      prisma.storefrontEvent.findMany({ where, select: { country: true } }),
      prisma.storefrontEvent.findMany({ where, select: { referrer: true } }),
      prisma.storefrontEvent.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          eventType: true,
          productId: true,
          country: true,
          device: true,
          createdAt: true,
        },
      }),
    ]);

  const clickRows = await prisma.storefrontEvent.findMany({
    where: { ...where, eventType: "click" },
    select: { productId: true },
  });
  const productIds = [...new Set(clickRows.map((r) => r.productId).filter(Boolean) as string[])];
  const products = productIds.length
    ? await prisma.productCard.findMany({
        where: { id: { in: productIds } },
        select: { id: true, title: true },
      })
    : [];
  const labelOf = new Map(products.map((p) => [p.id, p.title]));
  const topMap = new Map<string, number>();
  for (const r of clickRows) {
    if (!r.productId) continue;
    topMap.set(r.productId, (topMap.get(r.productId) ?? 0) + 1);
  }
  const topProducts = [...topMap.entries()]
    .map(([id, count]) => ({
      id,
      label: labelOf.get(id) ?? "Unknown product",
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalViews,
    totalClicks,
    uniqueVisitors: new Set(ipRows.map((r) => r.ipHash).filter(Boolean)).size,
    topProducts,
    timeline: buildTimeline(timelineRows.map((r) => r.createdAt), range),
    devices: groupField(deviceRows, "device"),
    browsers: groupField(browserRows, "browser"),
    countries: groupField(countryRows, "country"),
    referrers: groupField(referrerRows, "referrer"),
    recentActivity: activityRows,
  };
}

function emptyAnalytics(): StorefrontAnalytics {
  return {
    totalViews: 0,
    totalClicks: 0,
    uniqueVisitors: 0,
    topProducts: [],
    timeline: [],
    devices: [],
    browsers: [],
    countries: [],
    referrers: [],
    recentActivity: [],
  };
}
