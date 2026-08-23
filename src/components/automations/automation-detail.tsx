"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  ExternalLink,
  Loader2,
  PencilLine,
  Power,
  PowerOff,
  CheckCircle2,
  XCircle,
  Clock,
  Hash,
} from "lucide-react";
import {
  fetchJson,
  useAutomation,
} from "@/hooks/use-automations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AutomationFormDialog } from "@/components/automations/automation-form";
import { toast } from "sonner";

export function activityLabel(eventType: string): string {
  switch (eventType) {
    case "comment_received":
      return "Comment received";
    case "keyword_matched":
      return "Keyword matched";
    case "reply_attempted":
      return "Reply attempted";
    case "reply_successful":
      return "Reply sent";
    case "reply_failed":
      return "Reply failed";
    case "duplicate_event":
      return "Duplicate event";
    case "rate_limited":
      return "Rate limited";
    case "error":
      return "Processing error";
    default:
      return eventType;
  }
}

type ActivityItem = {
  id: string;
  eventType: string;
  commentId: string | null;
  mediaId: string | null;
  commenterUsername: string | null;
  commentText: string | null;
  replyId: string | null;
  createdAt: string;
};

export function AutomationDetail({ automationId }: { automationId: string }) {
  const qc = useQueryClient();
  const { data: automation, isLoading } = useAutomation(automationId);
  const [editOpen, setEditOpen] = useState(false);

  const statusMutation = useMutation({
    mutationFn: (status: string) =>
      fetchJson(`/api/automations/${automationId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["automations", automationId] });
      qc.invalidateQueries({ queryKey: ["automations"] });
      toast.success("Automation updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!automation) {
    return <div className="py-10 text-center text-muted-foreground">Automation not found.</div>;
  }

  const active = automation.status === "active";

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{automation.name}</h1>
          <p className="text-sm text-muted-foreground">
            Replies to comments mentioning your keyword on @{automation.socialAccount.username}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={active ? "outline" : "default"}
            onClick={() =>
              statusMutation.mutate(active ? "paused" : "active")
            }
            disabled={automation.status === "error" || automation.status === "disabled"}
          >
            {active ? (
              <PowerOff className="mr-2 h-4 w-4" />
            ) : (
              <Power className="mr-2 h-4 w-4" />
            )}
            {active ? "Pause" : "Activate"}
            {statusMutation.isPending && (
              <Loader2 className="ml-2 h-3.5 w-3.5 animate-spin" />
            )}
          </Button>
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <PencilLine className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" nativeButton={false} render={<Link href={`/automations/${automationId}/analytics`} />}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <DetailsCard automation={automation} />
        <ActivityCard automationId={automationId} className="lg:col-span-2" />
      </div>

      <AutomationFormDialog open={editOpen} onOpenChange={setEditOpen} automation={automation} />
    </div>
  );
}

function DetailsCard({
  automation,
}: {
  automation: {
    name: string;
    keywords: string[];
    replyMessage: string;
    url: string;
    cooldownMinutes: number;
    status: string;
    socialAccount: { username: string };
  };
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Details</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Badge variant={automation.status === "active" ? "secondary" : "default"}>
            {automation.status}
          </Badge>
        </div>
        <div className="grid gap-3">
          <DetailRow icon={Hash} label="Keywords">
            {automation.keywords.join(", ")}
          </DetailRow>
          <DetailRow icon={Clock} label="Cooldown">
            {automation.cooldownMinutes} min
          </DetailRow>
          <DetailRow label="Destination">
            <a
              href={automation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex max-w-full items-center gap-1 truncate text-primary hover:underline"
            >
              <span className="truncate">{automation.url}</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
          </DetailRow>
        </div>
        <div className="grid gap-1.5 rounded-lg border bg-muted/30 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Reply message
          </p>
          <p className="whitespace-pre-wrap">{automation.replyMessage}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon?: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-0.5">
      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
        {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
        {label}
      </p>
      <p className="text-sm">{children}</p>
    </div>
  );
}

function ActivityCard({
  automationId,
  className,
}: {
  automationId: string;
  className?: string;
}) {
  const { data, isLoading } = useActivity(automationId);
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (data ?? []).length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No comments processed yet.
          </p>
        ) : (
          <div className="grid max-h-96 gap-1 overflow-y-auto pr-1">
            {(data ?? []).slice(0, 30).map((a) => (
              <ActivityRow key={a.id} activity={a} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function useActivity(automationId: string) {
  return useQuery({
    queryKey: ["automation-activity", automationId],
    queryFn: () =>
      fetchJson<ActivityItem[]>(`/api/automations/${automationId}/activity`),
  });
}

function ActivityRow({ activity }: { activity: ActivityItem }) {
  const tone = toneFor(activity.eventType);
  return (
    <div className="flex items-start gap-3 rounded-lg px-2 py-2 hover:bg-muted/50">
      <span
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${tone.bg}`}
      >
        <ActivityIcon eventType={activity.eventType} toneFg={tone.fg} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">
          {activity.commenterUsername ? `@${activity.commenterUsername}` : "Someone"}
        </p>
        {activity.commentText ? (
          <p className="truncate text-xs text-muted-foreground">
            &ldquo;{activity.commentText}&rdquo;
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <span className="text-xs font-medium">{activityLabel(activity.eventType)}</span>
        <span className="text-xs text-muted-foreground">{timeAgo(activity.createdAt)}</span>
      </div>
    </div>
  );
}

function ActivityIcon({
  eventType,
  toneFg,
}: {
  eventType: string;
  toneFg: string;
}) {
  switch (eventType) {
    case "reply_successful":
      return <CheckCircle2 className={`h-4 w-4 ${toneFg}`} />;
    case "reply_failed":
    case "error":
      return <XCircle className={`h-4 w-4 ${toneFg}`} />;
    default:
      return <Hash className={`h-4 w-4 ${toneFg}`} />;
  }
}

function toneFor(eventType: string): { bg: string; fg: string } {
  switch (eventType) {
    case "reply_successful":
      return { bg: "bg-emerald-500/10", fg: "text-emerald-600" };
    case "reply_failed":
    case "error":
      return { bg: "bg-red-500/10", fg: "text-red-600" };
    case "rate_limited":
      return { bg: "bg-amber-500/10", fg: "text-amber-600" };
    default:
      return { bg: "bg-muted", fg: "text-muted-foreground" };
  }
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