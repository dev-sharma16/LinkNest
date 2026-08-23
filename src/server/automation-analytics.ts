import { prisma } from "@/lib/prisma";
import type { Range } from "@/lib/analytics";
import { RANGE_OPTIONS } from "@/lib/analytics";

export { RANGE_OPTIONS };
export type { Range };

export type AutomationActivityItem = {
  id: string;
  eventType: string;
  commentId: string | null;
  mediaId: string | null;
  commenterUsername: string | null;
  commentText: string | null;
  replyId: string | null;
  createdAt: Date;
};

export type AutomationAnalytics = {
  commentsReceived: number;
  keywordMatches: number;
  repliesAttempted: number;
  repliesSuccessful: number;
  repliesFailed: number;
  uniqueUsers: number;
  errorRate: number;
  timeline: { date: string; count: number }[];
  topAutomations: { id: string; label: string; count: number }[];
  recentActivity: AutomationActivityItem[];
};

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
  const result: { date: string; count: number }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now - i * step);
    if (isHourly) d.setMinutes(0, 0, 0);
    result.push({ date: fmt.format(d), count: buckets.get(fmt.format(d)) ?? 0 });
  }
  return result;
}

async function compute(
  automationId: string | null,
  userId: string,
  range: Range,
): Promise<AutomationAnalytics> {
  const start = rangeStart(range);

  const ownedAutomationIds = await prisma.commentAutomation.findMany({
    where: { userId, deletedAt: null },
    select: { id: true },
  });
  const ids = ownedAutomationIds.map((a) => a.id);

  if (automationId && !ids.includes(automationId)) return emptyAnalytics();
  const scoped = automationId ? [automationId] : ids;
  const baseWhere = {
    automationId: { in: scoped },
    ...(start ? { createdAt: { gte: start } } : {}),
  };

  const [commentsReceived, keywordMatches, repliesAttempted, repliesSuccessful, repliesFailed] =
    await Promise.all([
      prisma.automationEvent.count({ where: { ...baseWhere, eventType: "comment_received" } }),
      prisma.automationEvent.count({ where: { ...baseWhere, eventType: "keyword_matched" } }),
      prisma.automationEvent.count({ where: { ...baseWhere, eventType: "reply_attempted" } }),
      prisma.automationEvent.count({ where: { ...baseWhere, eventType: "reply_successful" } }),
      prisma.automationEvent.count({ where: { ...baseWhere, eventType: "reply_failed" } }),
    ]);

  const [successRows, timelineRows, recentActivity] = await Promise.all([
    prisma.automationEvent.findMany({
      where: { ...baseWhere, eventType: "reply_successful" },
      select: { commenterUsername: true, automationId: true },
    }),
    prisma.automationEvent.findMany({
      where: { ...baseWhere, eventType: "reply_successful" },
      select: { createdAt: true },
    }),
    prisma.automationEvent.findMany({
      where: baseWhere,
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        id: true,
        eventType: true,
        commentId: true,
        mediaId: true,
        commenterUsername: true,
        commentText: true,
        replyId: true,
        createdAt: true,
      },
    }),
  ]);

  const idsToLabel = automationId
    ? []
    : await prisma.commentAutomation.findMany({
        where: { id: { in: scoped } },
        select: { id: true, name: true },
      });
  const labelOf = new Map(idsToLabel.map((a) => [a.id, a.name]));
  const topMap = new Map<string, number>();
  for (const r of successRows) {
    topMap.set(r.automationId, (topMap.get(r.automationId) ?? 0) + 1);
  }
  const topAutomations = [...topMap.entries()]
    .map(([id, count]) => ({
      id,
      label: labelOf.get(id) ?? "Automation",
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    commentsReceived,
    keywordMatches,
    repliesAttempted,
    repliesSuccessful,
    repliesFailed,
    uniqueUsers: new Set(
      successRows.map((r) => r.commenterUsername).filter(Boolean),
    ).size,
    errorRate: repliesAttempted ? repliesFailed / repliesAttempted : 0,
    timeline: buildTimeline(timelineRows.map((r) => r.createdAt), range),
    topAutomations,
    recentActivity,
  };
}

export async function getAutomationAnalytics(
  userId: string,
  range: Range = "7d",
): Promise<AutomationAnalytics> {
  return compute(null, userId, range);
}

export async function getAutomationAnalyticsForAutomation(
  userId: string,
  automationId: string,
  range: Range = "7d",
): Promise<AutomationAnalytics> {
  return compute(automationId, userId, range);
}

export async function getAutomationActivity(
  userId: string,
  automationId: string,
): Promise<AutomationActivityItem[]> {
  const owned = await prisma.commentAutomation.findFirst({
    where: { id: automationId, userId, deletedAt: null },
    select: { id: true },
  });
  if (!owned) return [];
  return prisma.automationEvent.findMany({
    where: { automationId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      eventType: true,
      commentId: true,
      mediaId: true,
      commenterUsername: true,
      commentText: true,
      replyId: true,
      createdAt: true,
    },
  });
}

function emptyAnalytics(): AutomationAnalytics {
  return {
    commentsReceived: 0,
    keywordMatches: 0,
    repliesAttempted: 0,
    repliesSuccessful: 0,
    repliesFailed: 0,
    uniqueUsers: 0,
    errorRate: 0,
    timeline: [],
    topAutomations: [],
    recentActivity: [],
  };
}