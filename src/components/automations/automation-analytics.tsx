"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  MessagesSquare,
  CheckCircle2,
  XCircle,
  Users,
} from "lucide-react";
import { fetchJson } from "@/hooks/use-automations";
import type { AutomationAnalytics } from "@/server/automation-analytics";
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
import { activityLabel } from "@/components/automations/automation-detail";

export function AutomationAnalyticsPage({ scope }: { scope: "all" | { id: string } }) {
  const [range, setRange] = useState<Range>("7d");
  const url =
    scope === "all"
      ? `/api/automations/analytics?range=${range}`
      : `/api/automations/${scope.id}/analytics?range=${range}`;

  const { data, isLoading } = useQuery({
    queryKey: ["automation-analytics", scope === "all" ? "all" : scope.id, range],
    queryFn: () => fetchJson<AutomationAnalytics>(url),
  });

  const errorRate = data ? Math.round(data.errorRate * 100) : 0;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Automation analytics</h1>
          <p className="text-sm text-muted-foreground">
            {scope === "all"
              ? "Performance across all your comment automations."
              : "Performance for this automation."}
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={MessagesSquare} label="Comments received" value={data?.commentsReceived} loading={isLoading} />
        <StatCard icon={CheckCircle2} label="Replies sent" value={data?.repliesSuccessful} loading={isLoading} />
        <StatCard icon={XCircle} label="Replies failed" value={data?.repliesFailed} loading={isLoading} />
        <StatCard icon={Users} label="Unique users" value={data?.uniqueUsers} loading={isLoading} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat label="Keyword matches" value={data?.keywordMatches} loading={isLoading} />
        <MiniStat label="Replies attempted" value={data?.repliesAttempted} loading={isLoading} />
        <MiniStat label="Error rate" value={errorRate} suffix="%" loading={isLoading} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Replies over time</CardTitle>
          <CardDescription>Successful replies across the selected range</CardDescription>
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
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {(data?.topAutomations ?? []).length > 0 && scope === "all" ? (
        <Card>
          <CardHeader>
            <CardTitle>Top automations</CardTitle>
            <CardDescription>Most successful replies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {(data?.topAutomations ?? []).map((a, i) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-muted/60">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold">
                      {i + 1}
                    </span>
                    <span className="truncate text-sm font-medium">{a.label}</span>
                  </span>
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {a.count} replies
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

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
              {(data?.recentActivity ?? []).slice(0, 12).map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                    <ActivityDot eventType={a.eventType} />
                    <span className="truncate">{activityLabel(a.eventType)}</span>
                    {a.commenterUsername ? (
                      <span className="truncate text-xs">· @{a.commenterUsername}</span>
                    ) : null}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {timeAgo(a.createdAt)}
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
            <p className="text-2xl font-bold tabular-nums">{(value ?? 0).toLocaleString()}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MiniStat({
  label,
  value,
  suffix,
  loading,
}: {
  label: string;
  value: number | undefined;
  suffix?: string;
  loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        {loading ? (
          <Skeleton className="mt-1 h-7 w-16" />
        ) : (
          <p className="text-2xl font-bold tabular-nums">
            {(value ?? 0).toLocaleString()}
            {suffix ? <span className="text-base font-medium text-muted-foreground">{suffix}</span> : null}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityDot({ eventType }: { eventType: string }) {
  const color =
    eventType === "reply_successful"
      ? "bg-emerald-500"
      : eventType === "reply_failed" || eventType === "error"
        ? "bg-red-500"
        : eventType === "rate_limited"
          ? "bg-amber-500"
          : "bg-muted-foreground/40";
  return <span className={`h-2 w-2 shrink-0 rounded-full ${color}`} />;
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