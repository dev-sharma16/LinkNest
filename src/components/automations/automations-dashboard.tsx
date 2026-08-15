"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Copy,
  Trash2,
  BarChart3,
  MoreHorizontal,
  Loader2,
  MessageSquareText,
  Search,
  Power,
  PowerOff,
} from "lucide-react";
import {
  fetchJson,
  useAutomations,
  useSocialAccounts,
  type AutomationItem,
} from "@/hooks/use-automations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  AutomationFormDialog,
} from "@/components/automations/automation-form";
import {
  SocialAccountsSection,
} from "@/components/automations/social-accounts-section";
import { toast } from "sonner";

type StatusFilter = "all" | AutomationItem["status"];

export function AutomationsDashboard() {
  const qc = useQueryClient();
  const { data, isLoading } = useAutomations();
  const { data: accounts } = useSocialAccounts();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleting, setDeleting] = useState<AutomationItem | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["automations"] });
    qc.invalidateQueries({ queryKey: ["automations", deleting?.id] });
  };

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      fetchJson(`/api/automations/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }),
    onSuccess: (_d, vars) => {
      invalidate();
      toast.success(vars.status === "active" ? "Automation activated" : "Automation updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/automations/${id}/duplicate`, { method: "POST" }),
    onSuccess: () => {
      invalidate();
      toast.success("Automation duplicated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetchJson<{ ok: true }>(`/api/automations/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      invalidate();
      setDeleting(null);
      toast.success("Automation deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const items = useMemo(() => {
    const list = data ?? [];
    const lower = query.trim().toLowerCase();
    return list.filter((a) => {
      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      const matchesQuery =
        !lower ||
        a.name.toLowerCase().includes(lower) ||
        a.url.toLowerCase().includes(lower) ||
        a.keywords.some((k) => k.toLowerCase().includes(lower));
      return matchesStatus && matchesQuery;
    });
  }, [data, query, statusFilter]);

  const hasAccounts = (accounts ?? []).length > 0;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Comment Automation</h1>
          <p className="text-sm text-muted-foreground">
            Automatically reply to comments that mention your keyword.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} disabled={!hasAccounts}>
          <Plus className="mr-2 h-4 w-4" />
          New automation
        </Button>
      </div>

      <SocialAccountsSection />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search automations…"
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MessageSquareText className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 font-medium">
              {query || statusFilter !== "all" ? "No matching automations" : "No automations yet"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first automation to auto-reply with your link.
            </p>
            <Button className="mt-6" onClick={() => setCreateOpen(true)} disabled={!hasAccounts}>
              <Plus className="mr-2 h-4 w-4" />
              Create automation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((a) => (
            <AutomationRow
              key={a.id}
              automation={a}
              onToggle={() =>
                statusMutation.mutate({
                  id: a.id,
                  status: a.status === "active" ? "paused" : "active",
                })
              }
              onDuplicate={() => duplicateMutation.mutate(a.id)}
              onDelete={() => setDeleting(a)}
              busy={statusMutation.isPending || duplicateMutation.isPending}
            />
          ))}
        </div>
      )}

      <AutomationFormDialog open={createOpen} onOpenChange={setCreateOpen} />

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete automation?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleting?.name}&rdquo; and its activity history will be
              permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleting && deleteMutation.mutate(deleting.id)}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AutomationRow({
  automation,
  onToggle,
  onDuplicate,
  onDelete,
  busy,
}: {
  automation: AutomationItem;
  onToggle: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  busy: boolean;
}) {
  const active = automation.status === "active";
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
        <Link
          href={`/automations/${automation.id}`}
          className="min-w-0 flex-1 rounded-md"
        >
          <div className="flex items-center gap-3">
            <div
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                active ? "bg-emerald-500" : "bg-muted-foreground/40"
              }`}
            />
            <div className="min-w-0">
              <p className="truncate font-medium">{automation.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                Keyword: {automation.keywords.join(", ")} · @{automation.socialAccount.username}
              </p>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Badge variant={statusVariant(automation.status)}>{automation.status}</Badge>
          <span className="text-xs tabular-nums text-muted-foreground">
            {automation._count.events} events
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggle}
            disabled={automation.status === "error" || automation.status === "disabled" || busy}
          >
            {active ? (
              <PowerOff className="mr-1.5 h-3.5 w-3.5" />
            ) : (
              <Power className="mr-1.5 h-3.5 w-3.5" />
            )}
            {active ? "Pause" : "Activate"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              className="rounded-md p-1.5 hover:bg-muted"
              aria-label="Automation actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem render={<Link href={`/automations/${automation.id}`} />}>
                <MessageSquareText className="mr-2 h-4 w-4" />
                Activity
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href={`/automations/${automation.id}/analytics`} />}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled={busy} onClick={onDuplicate}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={onDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

function statusVariant(status: string): "default" | "secondary" | "destructive" {
  switch (status) {
    case "active":
      return "secondary";
    case "error":
      return "destructive";
    default:
      return "default";
  }
}