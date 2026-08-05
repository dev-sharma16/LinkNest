"use client";

import { useState } from "react";
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
import { Eye, MousePointerClick, Users } from "lucide-react";
import { fetchJson } from "@/hooks/use-storefronts";
import type { StorefrontAnalytics } from "@/server/storefront-analytics";
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

export function StorefrontAnalytics({ storefrontId }: { storefrontId: string }) {
  const [range, setRange] = useState<Range>("7d");

  const { data, isLoading } = useQuery({
    queryKey: ["storefront-analytics", storefrontId, range],
    queryFn: () =>
      fetchJson<StorefrontAnalytics>(
        `/api/storefronts/${storefrontId}/analytics?range=${range}`,
      ),
  });

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Storefront analytics</h1>
          <p className="text-sm text-muted-foreground">
            Engagement across your public storefront.
          </p>
        </div>
        <Select value={range} onValueChange={(v) => setRange(v as Range)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Eye} label="Store views" value={data?.totalViews} loading={isLoading} />
        <StatCard icon={MousePointerClick} label="Product clicks" value={data?.totalClicks} loading={isLoading} />
        <StatCard icon={Users} label="Unique visitors" value={data?.uniqueVisitors} loading={isLoading} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity timeline</CardTitle>
          <CardDescription>Views and clicks over time</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.timeline ?? []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={32} />
                <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} />
                <Bar dataKey="clicks" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <BucketsCard title="Devices" data={data?.devices ?? []} loading={isLoading} />
        <BucketsCard title="Browsers" data={data?.browsers ?? []} loading={isLoading} />
        <BucketsCard title="Countries" data={data?.countries ?? []} loading={isLoading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top products</CardTitle>
            <CardDescription>Most clicked products on your storefront</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (data?.topProducts ?? []).length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No clicks yet.</p>
            ) : (
              <div className="grid gap-2">
                {(data?.topProducts ?? []).map((p, i) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-muted/60">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold">
                        {i + 1}
                      </span>
                      <span className="truncate text-sm font-medium">{p.label}</span>
                    </span>
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {p.count} clicks
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (data?.recentActivity ?? []).length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              <div className="grid gap-1.5">
                {(data?.recentActivity ?? []).slice(0, 10).map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-sm">
                      <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
                      {a.eventType === "view" ? "Store view" : "Product click"}
                      {a.country ? ` · ${a.country}` : ""}
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
            <p className="text-2xl font-bold tabular-nums">{(value ?? 0).toLocaleString()}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function BucketsCard({
  title,
  data,
  loading,
}: {
  title: string;
  data: { value: string; count: number }[];
  loading: boolean;
}) {
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-24 w-full" />
        ) : data.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No data yet</p>
        ) : (
          <div className="grid gap-3">
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.slice(0, 6)} dataKey="count" nameKey="value" innerRadius={30} outerRadius={55} paddingAngle={2}>
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
                <div key={row.value} className="flex items-center justify-between text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
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
