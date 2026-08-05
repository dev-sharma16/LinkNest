"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  ArrowUpRight,
  Eye,
  LinkIcon,
  MousePointerClick,
  Store,
  UserRound,
  Users,
} from "lucide-react";
import { fetchJson } from "@/hooks/use-links";
import type { OverviewAnalytics } from "@/server/overview-analytics";
import type { Range } from "@/lib/analytics";
import { RANGE_OPTIONS } from "@/lib/analytics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = [
  "#6366f1",
  "#22d3ee",
  "#f59e0b",
  "#ef4444",
  "#10b981",
  "#a855f7",
  "#ec4899",
  "#f97316",
];

const SOURCE_BADGE: Record<string, string> = {
  links: "bg-indigo-500/10 text-indigo-500",
  bio: "bg-cyan-500/10 text-cyan-500",
  storefronts: "bg-amber-500/10 text-amber-500",
};

export function AnalyticsOverview() {
  const [range, setRange] = useState<Range>("30d");

  const { data, isLoading } = useQuery({
    queryKey: ["analytics-overview", range],
    queryFn: () =>
      fetchJson<OverviewAnalytics>(`/api/analytics/overview?range=${range}`),
  });

  const sources = data?.sources;
  const hasData = (data?.totals.engagements ?? 0) > 0;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Engagement across your links, link in bio, and storefronts.
          </p>
        </div>
        <Select value={range} onValueChange={(v) => setRange(v as Range)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={MousePointerClick}
          label="Total clicks"
          value={data?.totals.clicks}
          loading={isLoading}
        />
        <StatCard
          icon={Eye}
          label="Total views"
          value={data?.totals.views}
          loading={isLoading}
        />
        <StatCard
          icon={Activity}
          label="Engagements"
          value={data?.totals.engagements}
          loading={isLoading}
        />
        <StatCard
          icon={Users}
          label="Unique visitors"
          value={data?.totals.uniqueVisitors}
          loading={isLoading}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SourceCard
          icon={LinkIcon}
          title="Links"
          subtitle="Short link clicks"
          href="/links"
          clicks={sources?.links.clicks}
          unique={sources?.links.uniqueVisitors}
          loading={isLoading}
        />
        <SourceCard
          icon={UserRound}
          title="Link in Bio"
          subtitle="Public page views & clicks"
          href="/bio/analytics"
          views={sources?.bio.views}
          clicks={sources?.bio.clicks}
          unique={sources?.bio.uniqueVisitors}
          loading={isLoading}
        />
        <SourceCard
          icon={Store}
          title="Storefronts"
          subtitle="Store views & product clicks"
          href="/storefronts"
          views={sources?.storefronts.views}
          clicks={sources?.storefronts.clicks}
          unique={sources?.storefronts.uniqueVisitors}
          loading={isLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity timeline</CardTitle>
          <CardDescription>
            Clicks and views combined ·{" "}
            {RANGE_OPTIONS.find((o) => o.value === range)?.label}
          </CardDescription>
          <div className="flex items-center gap-4 pt-1">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-sm bg-indigo-500" />
              Clicks
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-sm bg-cyan-400" />
              Views
            </span>
          </div>
        </CardHeader>
        <CardContent className="h-80">
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.timeline ?? []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                />
                <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} />
                <Bar
                  dataKey="clicks"
                  stackId="a"
                  fill="#6366f1"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="views"
                  stackId="a"
                  fill="#22d3ee"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <BreakdownCard
          title="Countries"
          data={data?.countries ?? []}
          loading={isLoading}
        />
        <BreakdownCard
          title="Devices"
          data={data?.devices ?? []}
          loading={isLoading}
        />
        <BreakdownCard
          title="Browsers"
          data={data?.browsers ?? []}
          loading={isLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ListCard
          title="Top links"
          description="Most clicked short links"
          loading={isLoading}
        >
          {(data?.topLinks ?? []).length === 0 ? (
            <EmptyState href="/links" label="Create a link">
              No link clicks yet.
            </EmptyState>
          ) : (
            (data?.topLinks ?? []).map((link) => (
              <Link
                key={link.id}
                href={`/links/${link.id}`}
                className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-muted/60"
              >
                <span className="truncate text-sm font-medium">
                  {link.title || `/${link.slug}`}
                </span>
                <span className="ml-4 shrink-0 text-sm tabular-nums text-muted-foreground">
                  {link.clickCount.toLocaleString()} clicks
                </span>
              </Link>
            ))
          )}
        </ListCard>

        <ListCard
          title="Top bio blocks"
          description="Most clicked blocks on your page"
          loading={isLoading}
        >
          {(data?.topBlocks ?? []).length === 0 ? (
            <EmptyState href="/bio" label="Edit your page">
              No bio clicks yet.
            </EmptyState>
          ) : (
            (data?.topBlocks ?? []).map((b, i) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-muted/60"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold">
                    {i + 1}
                  </span>
                  <span className="truncate text-sm font-medium">
                    {b.label}
                  </span>
                </span>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {b.count.toLocaleString()} clicks
                </span>
              </div>
            ))
          )}
        </ListCard>

        <ListCard
          title="Top products"
          description="Most clicked storefront products"
          loading={isLoading}
        >
          {(data?.topProducts ?? []).length === 0 ? (
            <EmptyState href="/storefronts" label="Open storefronts">
              No product clicks yet.
            </EmptyState>
          ) : (
            (data?.topProducts ?? []).map((p, i) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-muted/60"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold">
                    {i + 1}
                  </span>
                  <span className="truncate text-sm font-medium">{p.label}</span>
                </span>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {p.count.toLocaleString()} clicks
                </span>
              </div>
            ))
          )}
        </ListCard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>
            Latest clicks and views across all sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : !hasData ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No activity yet. Share your links, page, and storefronts to see
              data here.
            </p>
          ) : (data?.recentActivity ?? []).length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No activity in this period.
            </p>
          ) : (
            <div className="grid gap-1.5">
              {(data?.recentActivity ?? []).map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-muted/40"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Badge
                      className={`shrink-0 capitalize ${SOURCE_BADGE[a.source]}`}
                    >
                      {a.source}
                    </Badge>
                    <span className="truncate font-medium">{a.label}</span>
                    <span className="hidden text-xs text-muted-foreground sm:inline">
                      {a.type === "view" ? "view" : "click"}
                      {a.country ? ` · ${a.country}` : ""}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {a.device ?? "Desktop"} · {timeAgo(a.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: number | undefined;
  loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="mt-1 h-7 w-16" />
          ) : (
            <p className="text-2xl font-bold tabular-nums">
              {(value ?? 0).toLocaleString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MiniStat({
  label,
  value,
  loading,
}: {
  label: string;
  value: number | undefined;
  loading: boolean;
}) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton className="mt-1 h-6 w-12" />
      ) : (
        <p className="text-xl font-bold tabular-nums">
          {(value ?? 0).toLocaleString()}
        </p>
      )}
    </div>
  );
}

function SourceCard({
  icon: Icon,
  title,
  subtitle,
  href,
  views,
  clicks,
  unique,
  loading,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  href: string;
  views?: number | undefined;
  clicks?: number | undefined;
  unique?: number | undefined;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Icon className="h-4.5 w-4.5" />
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription>{subtitle}</CardDescription>
            </div>
          </div>
          <Link
            href={href}
            aria-label={`View ${title} analytics`}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={`grid gap-2 ${
            views !== undefined ? "grid-cols-3" : "grid-cols-2"
          }`}
        >
          {views !== undefined && (
            <MiniStat label="Views" value={views} loading={loading} />
          )}
          <MiniStat label="Clicks" value={clicks} loading={loading} />
          <MiniStat label="Unique" value={unique} loading={loading} />
        </div>
      </CardContent>
    </Card>
  );
}

function BreakdownCard({
  title,
  data,
  loading,
}: {
  title: string;
  data: { value: string; count: number }[];
  loading: boolean;
}) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : data.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No data yet
          </p>
        ) : (
          <div className="grid gap-3">
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.slice(0, 6)}
                    dataKey="count"
                    nameKey="value"
                    innerRadius={35}
                    outerRadius={60}
                    paddingAngle={2}
                  >
                    {data.slice(0, 6).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid gap-1">
              {data.slice(0, 5).map((row, i) => (
                <div
                  key={row.value}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: COLORS[i % COLORS.length] }}
                    />
                    <span className="truncate">{row.value || "Unknown"}</span>
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {total > 0 ? Math.round((row.count / total) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ListCard({
  title,
  description,
  loading,
  children,
}: {
  title: string;
  description: string;
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="grid gap-1">{children}</div>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <p className="py-6 text-center text-sm text-muted-foreground">
      {children}{" "}
      <Link href={href} className="font-medium text-primary hover:underline">
        {label}
      </Link>
    </p>
  );
}

function timeAgo(iso: string | Date): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
