"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Store,
  ExternalLink,
  Copy,
  Archive,
  ArchiveRestore,
  Trash2,
  BarChart3,
  MoreHorizontal,
  Loader2,
  Settings2,
} from "lucide-react";
import { fetchJson, useStorefronts, type StorefrontItem } from "@/hooks/use-storefronts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { StorefrontFormDialog } from "@/components/storefronts/storefront-form";
import { toast } from "sonner";

export function StorefrontsDashboard() {
  const qc = useQueryClient();
  const { data, isLoading } = useStorefronts();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleting, setDeleting] = useState<StorefrontItem | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["storefronts"] });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/storefronts/${id}/duplicate`, { method: "POST" }),
    onSuccess: () => {
      invalidate();
      toast.success("Storefront duplicated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const archiveMutation = useMutation({
    mutationFn: ({ id, archived }: { id: string; archived: boolean }) =>
      fetchJson(`/api/storefronts/${id}/archive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived }),
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Storefront updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetchJson<{ ok: true }>(`/api/storefronts/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      invalidate();
      setDeleting(null);
      toast.success("Storefront deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const published = (data ?? []).filter((s) => s.published && !s.archived);
  const drafts = (data ?? []).filter((s) => !s.published && !s.archived);
  const archived = (data ?? []).filter((s) => s.archived);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Storefronts</h1>
          <p className="text-sm text-muted-foreground">
            Create beautiful recommendation pages for your favorite products.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New storefront
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : !data?.length ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Store className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 font-medium">No storefronts yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first storefront to start recommending products.
            </p>
            <Button className="mt-6" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create storefront
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {published.length > 0 && (
            <StorefrontGrid
              title="Published"
              items={published}
              onDuplicate={(id) => duplicateMutation.mutate(id)}
              onArchive={(id) => archiveMutation.mutate({ id, archived: true })}
              onDelete={(s) => setDeleting(s)}
              busy={duplicateMutation.isPending || archiveMutation.isPending}
            />
          )}
          {drafts.length > 0 && (
            <StorefrontGrid
              title="Drafts"
              items={drafts}
              onDuplicate={(id) => duplicateMutation.mutate(id)}
              onArchive={(id) => archiveMutation.mutate({ id, archived: true })}
              onDelete={(s) => setDeleting(s)}
              busy={duplicateMutation.isPending || archiveMutation.isPending}
            />
          )}
          {archived.length > 0 && (
            <StorefrontGrid
              title="Archived"
              items={archived}
              onDuplicate={(id) => duplicateMutation.mutate(id)}
              onArchive={(id) => archiveMutation.mutate({ id, archived: false })}
              onDelete={(s) => setDeleting(s)}
              busy={duplicateMutation.isPending || archiveMutation.isPending}
            />
          )}
        </>
      )}

      <StorefrontFormDialog open={createOpen} onOpenChange={setCreateOpen} />

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete storefront?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleting?.name}&rdquo; and all of its product cards will be permanently
              removed. This action cannot be undone.
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

function StorefrontGrid({
  title,
  items,
  onDuplicate,
  onArchive,
  onDelete,
  busy,
}: {
  title: string;
  items: StorefrontItem[];
  onDuplicate: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (s: StorefrontItem) => void;
  busy: boolean;
}) {
  return (
    <section className="grid gap-4">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((s) => (
          <Card key={s.id} className="overflow-hidden">
            {s.coverImage ? (
              <img
                src={s.coverImage}
                alt=""
                className="h-28 w-full object-cover"
                width={400}
                height={112}
              />
            ) : (
              <div className="flex h-28 items-center justify-center bg-muted">
                <Store className="h-8 w-8 text-muted-foreground/50" />
              </div>
            )}
            <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
              <div className="min-w-0">
                <CardTitle className="truncate">{s.name}</CardTitle>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  /s/{s.slug} · {s._count.products} product
                  {s._count.products === 1 ? "" : "s"}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="rounded-md p-1.5 hover:bg-muted"
                  aria-label="Storefront actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem render={<Link href={`/storefronts/${s.id}/edit`} />}>
                    <Settings2 className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href={`/storefronts/${s.id}/analytics`} />}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Analytics
                  </DropdownMenuItem>
                  {s.published ? (
                    <DropdownMenuItem render={<Link href={`/s/${s.slug}`} target="_blank" />}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View page
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled={busy} onClick={() => onDuplicate(s.id)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled={busy} onClick={() => onArchive(s.id)}>
                    {s.archived ? (
                      <ArchiveRestore className="mr-2 h-4 w-4" />
                    ) : (
                      <Archive className="mr-2 h-4 w-4" />
                    )}
                    {s.archived ? "Restore" : "Archive"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => onDelete(s)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
