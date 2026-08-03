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
import { Globe, MousePointerClick, Users, LinkIcon } from "lucide-react";
import { fetchJson } from "@/hooks/use-links";
import type { DashboardData } from "@/server/analytics";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const PIE_COLORS = [
  "#6366f1",
  "#22d3ee",
  "#f59e0b",
  "#ef4444",
  "#10b981",
  "#a855f7",
  "#ec4899",
];

export function DashboardOverview() {
  const [range, setRange] = useState<Range>("7d");

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", range],
    queryFn: () =>
      fetchJson<DashboardData>(`/api/dashboard?range=${range}`),
  });

  const topCountries = (data?.countries ?? []).slice(0, 5);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
          <p className="text-sm text-muted-foreground">
            Your link performance at a glance.
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

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={MousePointerClick}
          label="Clicks this period"
          value={data?.totalClicksRange}
          loading={isLoading}
        />
        <StatCard
          icon={Users}
          label="Unique visitors"
          value={data?.uniqueVisitors}
          loading={isLoading}
        />
        <StatCard
          icon={LinkIcon}
          label="Total links"
          value={data?.totalLinks}
          loading={isLoading}
        />
        <StatCard
          icon={Globe}
          label="All-time clicks"
          value={data?.totalClicks}
          loading={isLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Timeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Clicks over time</CardTitle>
            <CardDescription>
              {RANGE_OPTIONS.find((o) => o.value === range)?.label}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
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
                  <Bar dataKey="clicks" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Countries */}
        <Card>
          <CardHeader>
            <CardTitle>Top countries</CardTitle>
            <CardDescription>By click volume</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : topCountries.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topCountries}
                    dataKey="count"
                    nameKey="value"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {topCountries.map((_, i) => (
                      <Cell
                        key={i}
                        fill={PIE_COLORS[i % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top links */}
        <Card>
          <CardHeader>
            <CardTitle>Top links</CardTitle>
            <CardDescription>Your most clicked links</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid gap-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (data?.topLinks ?? []).length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <p>No links yet.</p>
                <Link
                  href="/links"
                  className="mt-2 inline-block font-medium text-primary hover:underline"
                >
                  Create your first link
                </Link>
              </div>
            ) : (
              <div className="grid gap-2">
                {(data?.topLinks ?? []).map((link, i) => (
                  <Link
                    key={link.id}
                    href={`/links/${link.id}`}
                    className="flex items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-muted/60"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {link.title || `/${link.slug}`}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          /{link.slug}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {link.clickCount.toLocaleString()}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent clicks</CardTitle>
            <CardDescription>Latest activity across your links</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid gap-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (data?.recentActivity ?? []).length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No activity yet. Share your links to get clicks.
              </div>
            ) : (
              <div className="grid gap-2">
                {(data?.recentActivity ?? []).slice(0, 6).map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center justify-between rounded-lg px-2 py-2"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate text-sm">
                        <span className="font-medium">/{act.slug}</span>
                        {act.country ? ` · ${act.country}` : ""}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {act.device ?? "Desktop"} · {timeAgo(act.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
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
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">{label}</p>
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