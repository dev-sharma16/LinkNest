import { prisma } from "@/lib/prisma";
import type { AggEntry, Range } from "@/lib/analytics";
import { RANGE_OPTIONS } from "@/lib/analytics";

export { RANGE_OPTIONS };
export type { Range };

const RANGE_MS: Record<Exclude<Range, "all">, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

function rangeStart(range: Range): Date | null {
  if (range === "all") return null;
  return new Date(Date.now() - RANGE_MS[range]);
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

export type LinkAnalytics = {
  totalClicks: number;
  uniqueClicks: number;
  countries: AggEntry[];
  cities: AggEntry[];
  browsers: AggEntry[];
  devices: AggEntry[];
  operatingSystems: AggEntry[];
  referrers: AggEntry[];
  timeline: { date: string; clicks: number }[];
};

export async function getLinkAnalytics(
  linkId: string,
  range: Range = "30d",
): Promise<LinkAnalytics> {
  const start = rangeStart(range);

  const baseWhere = { linkId, ...(start ? { createdAt: { gte: start } } : {}) };

  const [totalClicks, countries, browsers, devices, osRows, referrers, ipRows] =
    await Promise.all([
      prisma.click.count({ where: baseWhere }),
      prisma.click.findMany({
        where: baseWhere,
        select: { country: true },
      }),
      prisma.click.findMany({
        where: baseWhere,
        select: { browser: true },
      }),
      prisma.click.findMany({
        where: baseWhere,
        select: { device: true },
      }),
      prisma.click.findMany({
        where: baseWhere,
        select: { os: true },
      }),
      prisma.click.findMany({
        where: baseWhere,
        select: { referrer: true },
      }),
      prisma.click.findMany({ where: baseWhere, select: { ipHash: true } }),
    ]);

  const uniqueClicks = new Set(ipRows.map((r) => r.ipHash).filter(Boolean)).size;

  const cities = await prisma.click.findMany({
    where: { ...baseWhere, city: { not: null } },
    select: { city: true },
  });

  const timelineRows = await prisma.click.findMany({
    where: baseWhere,
    select: { createdAt: true },
  });

  return {
    totalClicks,
    uniqueClicks,
    countries: groupField(countries, "country"),
    cities: groupField(cities, "city"),
    browsers: groupField(browsers, "browser"),
    devices: groupField(devices, "device"),
    operatingSystems: groupField(osRows, "os"),
    referrers: groupField(referrers, "referrer"),
    timeline: buildTimeline(timelineRows.map((r) => r.createdAt), range),
  };
}

function buildTimeline(
  times: Date[],
  range: Range,
): { date: string; clicks: number }[] {
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
    const key = fmt.format(d);
    result.push({ date: key, clicks: buckets.get(key) ?? 0 });
  }
  return result;
}

export type DashboardData = {
  totalLinks: number;
  totalClicks: number;
  totalClicksRange: number;
  uniqueVisitors: number;
  topLinks: {
    id: string;
    slug: string;
    title: string | null;
    clickCount: number;
  }[];
  recentLinks: {
    id: string;
    slug: string;
    title: string | null;
    destination: string;
    createdAt: Date;
  }[];
  recentActivity: {
    id: string;
    slug: string;
    country: string | null;
    device: string | null;
    browser: string | null;
    createdAt: Date;
  }[];
  timeline: { date: string; clicks: number }[];
  countries: AggEntry[];
  devices: AggEntry[];
  browsers: AggEntry[];
};

export async function getDashboardData(
  userId: string,
  range: Range = "7d",
): Promise<DashboardData> {
  const links = await prisma.link.findMany({
    where: { userId, deletedAt: null },
    select: { id: true },
  });
  const linkIds = links.map((l) => l.id);
  const start = rangeStart(range);

  const clickWhere = {
    ...(start ? { createdAt: { gte: start } } : {}),
    ...(linkIds.length
      ? { linkId: { in: linkIds } }
      : { linkId: { in: [] } }),
  };

  const [totalLinks, totalClicksRange, totalClicks, timelineRows, countryRows, deviceRows, browserRows, uniqueRows] =
    await Promise.all([
      prisma.link.count({ where: { userId, deletedAt: null } }),
      prisma.click.count({ where: clickWhere }),
      prisma.click.count({ where: { linkId: { in: linkIds } } }),
      prisma.click.findMany({ where: clickWhere, select: { createdAt: true } }),
      prisma.click.findMany({ where: clickWhere, select: { country: true } }),
      prisma.click.findMany({ where: clickWhere, select: { device: true } }),
      prisma.click.findMany({ where: clickWhere, select: { browser: true } }),
      prisma.click.findMany({ where: clickWhere, select: { ipHash: true } }),
    ]);

  const [topLinks, recentLinks, recentActivity] = await Promise.all([
    prisma.link.findMany({
      where: { userId, deletedAt: null },
      orderBy: { clicks: { _count: "desc" } },
      take: 5,
      include: { _count: { select: { clicks: true } } },
    }),
    prisma.link.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, slug: true, title: true, destination: true, createdAt: true },
    }),
    prisma.click.findMany({
      where: clickWhere,
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { link: { select: { slug: true } } },
    }),
  ]);

  return {
    totalLinks,
    totalClicks,
    totalClicksRange,
    uniqueVisitors: new Set(uniqueRows.map((r) => r.ipHash).filter(Boolean)).size,
    topLinks: topLinks.map((l) => ({
      id: l.id,
      slug: l.slug,
      title: l.title,
      clickCount: l._count.clicks,
    })),
    recentLinks,
    recentActivity: recentActivity.map((c) => ({
      id: c.id,
      slug: c.link.slug,
      country: c.country,
      device: c.device,
      browser: c.browser,
      createdAt: c.createdAt,
    })),
    timeline: buildTimeline(
      timelineRows.map((r) => r.createdAt),
      range,
    ),
    countries: groupField(countryRows, "country"),
    devices: groupField(deviceRows, "device"),
    browsers: groupField(browserRows, "browser"),
  };
}