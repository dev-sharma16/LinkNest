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

export function AnalyticsOverview() {
  const [range, setRange] = useState<Range>("30d");

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", range],
    queryFn: () => fetchJson<DashboardData>(`/api/dashboard?range=${range}`),
  });

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Traffic insights across all your links.
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

      <Card>
        <CardHeader>
          <CardTitle>Click timeline</CardTitle>
          <CardDescription>
            {RANGE_OPTIONS.find((o) => o.value === range)?.label}
          </CardDescription>
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
                <Bar dataKey="clicks" fill="#6366f1" radius={[4, 4, 0, 0]} />
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

      <Card>
        <CardHeader>
          <CardTitle>Top links</CardTitle>
          <CardDescription>Most clicked links in this period</CardDescription>
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
              No data yet.{" "}
              <Link href="/links" className="font-medium text-primary hover:underline">
                Create a link
              </Link>
            </div>
          ) : (
            <div className="grid gap-1">
              {(data?.topLinks ?? []).map((link) => (
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
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