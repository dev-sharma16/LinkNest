import { prisma } from "@/lib/prisma";
import type { AggEntry, Range } from "@/lib/analytics";

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

function countUnique(ipHashes: (string | null)[]): number {
  return new Set(ipHashes.filter((h): h is string => Boolean(h))).size;
}

function blockLabel(type: string, config: Record<string, unknown>): string {
  if (typeof config.label === "string" && config.label) return config.label;
  if (typeof config.title === "string" && config.title) return config.title;
  if (typeof config.content === "string") {
    return (config.content as string).slice(0, 40);
  }
  return type.replace("_", " ");
}

function buildTimeline(
  rows: { at: Date; kind: "click" | "view" }[],
  range: Range,
): { date: string; clicks: number; views: number }[] {
  const isHourly = range === "24h";
  const fmt = new Intl.DateTimeFormat("en-CA", {
    ...(isHourly
      ? { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit" }
      : { year: "numeric", month: "2-digit", day: "2-digit" }),
  });

  const buckets = new Map<string, { clicks: number; views: number }>();
  for (const r of rows) {
    const key = fmt.format(new Date(r.at));
    const b = buckets.get(key) ?? { clicks: 0, views: 0 };
    if (r.kind === "click") b.clicks += 1;
    else b.views += 1;
    buckets.set(key, b);
  }

  const step = isHourly ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const count = isHourly ? 24 : range === "7d" ? 7 : 30;

  const now = Date.now();
  const result: { date: string; clicks: number; views: number }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now - i * step);
    if (isHourly) d.setMinutes(0, 0, 0);
    const key = fmt.format(d);
    const b = buckets.get(key);
    result.push({
      date: key,
      clicks: b?.clicks ?? 0,
      views: b?.views ?? 0,
    });
  }
  return result;
}

export type OverviewAnalytics = {
  totals: {
    clicks: number;
    views: number;
    engagements: number;
    uniqueVisitors: number;
  };
  sources: {
    links: { clicks: number; uniqueVisitors: number };
    bio: { views: number; clicks: number; uniqueVisitors: number };
    storefronts: { views: number; clicks: number; uniqueVisitors: number };
  };
  timeline: { date: string; clicks: number; views: number }[];
  countries: AggEntry[];
  devices: AggEntry[];
  browsers: AggEntry[];
  referrers: AggEntry[];
  topLinks: { id: string; slug: string; title: string | null; clickCount: number }[];
  topBlocks: { id: string; label: string; count: number }[];
  topProducts: { id: string; label: string; count: number }[];
  recentActivity: {
    id: string;
    source: "links" | "bio" | "storefronts";
    type: "click" | "view";
    label: string;
    country: string | null;
    device: string | null;
    createdAt: Date;
  }[];
};

export async function getOverviewAnalytics(
  userId: string,
  range: Range = "30d",
): Promise<OverviewAnalytics> {
  const start = rangeStart(range);
  const timeFilter = start ? { createdAt: { gte: start } } : {};

  const [links, profile, storefronts] = await Promise.all([
    prisma.link.findMany({
      where: { userId, deletedAt: null },
      select: { id: true },
    }),
    prisma.profile.findUnique({ where: { userId }, select: { id: true } }),
    prisma.storefront.findMany({
      where: { userId, deletedAt: null },
      select: { id: true },
    }),
  ]);

  const linkIds = links.map((l) => l.id);
  const sfIds = storefronts.map((s) => s.id);

  const [clicks, bioEvents, sfEvents] = await Promise.all([
    prisma.click.findMany({
      where: { linkId: { in: linkIds }, ...timeFilter },
      select: {
        id: true,
        linkId: true,
        ipHash: true,
        country: true,
        device: true,
        browser: true,
        referrer: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    profile
      ? prisma.bioEvent.findMany({
          where: { profileId: profile.id, ...timeFilter },
          select: {
            id: true,
            blockId: true,
            eventType: true,
            ipHash: true,
            country: true,
            device: true,
            browser: true,
            referrer: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
    prisma.storefrontEvent.findMany({
      where: { storefrontId: { in: sfIds }, ...timeFilter },
      select: {
        id: true,
        productId: true,
        eventType: true,
        ipHash: true,
        country: true,
        device: true,
        browser: true,
        referrer: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const bioClicks = bioEvents.filter((e) => e.eventType === "click");
  const bioViews = bioEvents.filter((e) => e.eventType === "view");
  const sfClicks = sfEvents.filter((e) => e.eventType === "click");
  const sfViews = sfEvents.filter((e) => e.eventType === "view");

  const clicksTotal = clicks.length + bioClicks.length + sfClicks.length;
  const viewsTotal = bioViews.length + sfViews.length;

  const linkUnique = countUnique(clicks.map((c) => c.ipHash));
  const bioUnique = countUnique(bioEvents.map((e) => e.ipHash));
  const sfUnique = countUnique(sfEvents.map((e) => e.ipHash));

  const timeline = buildTimeline(
    [
      ...clicks.map((c) => ({ at: c.createdAt, kind: "click" as const })),
      ...bioEvents.map((e) => ({
        at: e.createdAt,
        kind: (e.eventType === "view" ? "view" : "click") as "click" | "view",
      })),
      ...sfEvents.map((e) => ({
        at: e.createdAt,
        kind: (e.eventType === "view" ? "view" : "click") as "click" | "view",
      })),
    ],
    range,
  );

  const allRows = [...clicks, ...bioEvents, ...sfEvents];

  // ---- Top links ----
  const linkCounts = new Map<string, number>();
  for (const c of clicks) {
    linkCounts.set(c.linkId, (linkCounts.get(c.linkId) ?? 0) + 1);
  }
  const topLinkIds = [...linkCounts.keys()].slice(0, 5);
  const linkMeta = topLinkIds.length
    ? await prisma.link.findMany({
        where: { id: { in: topLinkIds } },
        select: { id: true, slug: true, title: true },
      })
    : [];
  const linkMetaMap = new Map(linkMeta.map((l) => [l.id, l]));
  const topLinks = [...linkCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => {
      const l = linkMetaMap.get(id);
      return {
        id,
        slug: l?.slug ?? "deleted",
        title: l?.title ?? null,
        clickCount: count,
      };
    });

  // ---- Top bio blocks ----
  const blockCounts = new Map<string, number>();
  for (const e of bioClicks) {
    if (!e.blockId) continue;
    blockCounts.set(e.blockId, (blockCounts.get(e.blockId) ?? 0) + 1);
  }
  const blockIds = [...blockCounts.keys()].slice(0, 10);
  const blocks = blockIds.length
    ? await prisma.bioBlock.findMany({
        where: { id: { in: blockIds } },
        select: { id: true, type: true, config: true },
      })
    : [];
  const blockLabelMap = new Map(
    blocks.map((b) => [
      b.id,
      blockLabel(b.type, (b.config ?? {}) as Record<string, unknown>),
    ]),
  );
  const topBlocks = [...blockCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({
      id,
      label: blockLabelMap.get(id) ?? "Unknown block",
      count,
    }));

  // ---- Top storefront products ----
  const productCounts = new Map<string, number>();
  for (const e of sfClicks) {
    if (!e.productId) continue;
    productCounts.set(e.productId, (productCounts.get(e.productId) ?? 0) + 1);
  }
  const productIds = [...productCounts.keys()].slice(0, 10);
  const products = productIds.length
    ? await prisma.productCard.findMany({
        where: { id: { in: productIds } },
        select: { id: true, title: true },
      })
    : [];
  const productLabelMap = new Map(products.map((p) => [p.id, p.title]));
  const topProducts = [...productCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({
      id,
      label: productLabelMap.get(id) ?? "Unknown product",
      count,
    }));

  // ---- Recent activity (merged across sources) ----
  const recent = [
    ...clicks.slice(0, 8).map((c) => ({
      id: c.id,
      source: "links" as const,
      type: "click" as const,
      refId: c.linkId,
      country: c.country,
      device: c.device,
      createdAt: c.createdAt,
    })),
    ...bioEvents.slice(0, 8).map((e) => ({
      id: e.id,
      source: "bio" as const,
      type: (e.eventType === "view" ? "view" : "click") as "click" | "view",
      refId: e.blockId,
      country: e.country,
      device: e.device,
      createdAt: e.createdAt,
    })),
    ...sfEvents.slice(0, 8).map((e) => ({
      id: e.id,
      source: "storefronts" as const,
      type: (e.eventType === "view" ? "view" : "click") as "click" | "view",
      refId: e.productId,
      country: e.country,
      device: e.device,
      createdAt: e.createdAt,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 12);

  const recentLinkIds = [
    ...new Set(
      recent.filter((r) => r.source === "links").map((r) => r.refId),
    ),
  ].filter(Boolean);
  const recentBlockIds = [
    ...new Set(recent.filter((r) => r.source === "bio").map((r) => r.refId)),
  ].filter((id): id is string => Boolean(id));
  const recentProductIds = [
    ...new Set(
      recent.filter((r) => r.source === "storefronts").map((r) => r.refId),
    ),
  ].filter((id): id is string => Boolean(id));

  const [recentLinks, recentBlocks, recentProducts] = await Promise.all([
    recentLinkIds.length
      ? prisma.link.findMany({
          where: { id: { in: recentLinkIds } },
          select: { id: true, slug: true, title: true },
        })
      : Promise.resolve([]),
    recentBlockIds.length
      ? prisma.bioBlock.findMany({
          where: { id: { in: recentBlockIds } },
          select: { id: true, type: true, config: true },
        })
      : Promise.resolve([]),
    recentProductIds.length
      ? prisma.productCard.findMany({
          where: { id: { in: recentProductIds } },
          select: { id: true, title: true },
        })
      : Promise.resolve([]),
  ]);

  const recentLinkMap = new Map(recentLinks.map((l) => [l.id, l]));
  const recentBlockMap = new Map(
    recentBlocks.map((b) => [
      b.id,
      blockLabel(b.type, (b.config ?? {}) as Record<string, unknown>),
    ]),
  );
  const recentProductMap = new Map(
    recentProducts.map((p) => [p.id, p.title]),
  );

  const recentActivity = recent.map((r) => {
    let label = "";
    if (r.source === "links") {
      const l = recentLinkMap.get(r.refId);
      label = l?.title || (l?.slug ? `/${l.slug}` : "Deleted link");
    } else if (r.source === "bio") {
      label = r.refId
        ? (recentBlockMap.get(r.refId) ?? "Bio block")
        : "Bio block";
    } else {
      label = r.refId
        ? (recentProductMap.get(r.refId) ?? "Product")
        : "Product";
    }
    return {
      id: r.id,
      source: r.source,
      type: r.type,
      label,
      country: r.country,
      device: r.device,
      createdAt: r.createdAt,
    };
  });

  return {
    totals: {
      clicks: clicksTotal,
      views: viewsTotal,
      engagements: clicksTotal + viewsTotal,
      uniqueVisitors: countUnique(allRows.map((r) => r.ipHash)),
    },
    sources: {
      links: { clicks: clicks.length, uniqueVisitors: linkUnique },
      bio: {
        views: bioViews.length,
        clicks: bioClicks.length,
        uniqueVisitors: bioUnique,
      },
      storefronts: {
        views: sfViews.length,
        clicks: sfClicks.length,
        uniqueVisitors: sfUnique,
      },
    },
    timeline,
    countries: groupField(allRows, "country"),
    devices: groupField(allRows, "device"),
    browsers: groupField(allRows, "browser"),
    referrers: groupField(allRows, "referrer"),
    topLinks,
    topBlocks,
    topProducts,
    recentActivity,
  };
}
