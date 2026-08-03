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
import { MousePointerClick, Users } from "lucide-react";
import { fetchJson } from "@/hooks/use-links";
import type { LinkAnalytics } from "@/server/analytics";
import type { Range } from "@/lib/analytics";
import { RANGE_OPTIONS } from "@/lib/analytics";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export function LinkAnalytics({ linkId, slug }: { linkId: string; slug: string }) {
  const [range, setRange] = useState<Range>("30d");

  const { data, isLoading } = useQuery({
    queryKey: ["link-analytics", linkId, range],
    queryFn: () =>
      fetchJson<LinkAnalytics>(
        `/api/analytics/links/${linkId}?range=${range}`,
      ),
  });

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Analytics for <span className="font-medium text-foreground">/{slug}</span>
        </p>
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MousePointerClick className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total clicks</p>
              {isLoading ? (
                <Skeleton className="mt-1 h-7 w-16" />
              ) : (
                <p className="text-2xl font-bold tabular-nums">
                  {(data?.totalClicks ?? 0).toLocaleString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unique visitors</p>
              {isLoading ? (
                <Skeleton className="mt-1 h-7 w-16" />
              ) : (
                <p className="text-2xl font-bold tabular-nums">
                  {(data?.uniqueClicks ?? 0).toLocaleString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <BucketsCard
          title="Countries"
          data={data?.countries ?? []}
          loading={isLoading}
        />
        <BucketsCard
          title="Cities"
          data={data?.cities ?? []}
          loading={isLoading}
        />
        <BucketsCard
          title="Devices"
          data={data?.devices ?? []}
          loading={isLoading}
        />
        <BucketsCard
          title="Browsers"
          data={data?.browsers ?? []}
          loading={isLoading}
        />
        <BucketsCard
          title="Operating systems"
          data={data?.operatingSystems ?? []}
          loading={isLoading}
        />
        <BucketsCard
          title="Referrers"
          data={data?.referrers ?? []}
          loading={isLoading}
        />
      </div>
    </div>
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
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.slice(0, 6)}
                    dataKey="count"
                    nameKey="value"
                    innerRadius={30}
                    outerRadius={55}
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