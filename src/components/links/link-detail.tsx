"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Copy,
  QrCode,
  Trash2,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { fetchJson, useFolders, useTags } from "@/hooks/use-links";
import {
  useUpdateLink,
  useDeleteLinks,
  useToggleFavorite,
} from "@/hooks/use-link-mutations";
import { LinkForm } from "@/components/links/link-form";
import { LinkAnalytics } from "@/components/links/link-analytics";
import { QrTab } from "@/components/links/qr-tab";
import type { LinkItem } from "@/hooks/use-links";
import type { CreateLinkValues } from "@/lib/validations/links";

export function LinkDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: link, isLoading } = useQuery({
    queryKey: ["link", id],
    queryFn: () => fetchJson<LinkItem>(`/api/links/${id}`),
  });
  const folders = useFolders();
  const tags = useTags();

  const updateLink = useUpdateLink();
  const deleteLinks = useDeleteLinks();
  const toggleFavorite = useToggleFavorite();

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!link) {
    return (
      <div className="grid gap-4 py-16 text-center">
        <p className="text-muted-foreground">Link not found.</p>
        <div>
          <Button variant="outline" nativeButton={false} render={<Link href="/links" />}>
            Back to links
          </Button>
        </div>
      </div>
    );
  }

  const current = link;

  function copy() {
    navigator.clipboard.writeText(current.shortUrl);
    toast.success("Link copied");
  }

  const formValues: Partial<CreateLinkValues> = {
    destination: link.destination,
    slug: link.slug,
    title: link.title ?? "",
    description: link.description ?? "",
    notes: link.notes ?? "",
    folderId: link.folder?.id ?? "__none__",
    tagIds: link.tags.map((t) => t.id),
    expiresAt: link.expiresAt ? new Date(link.expiresAt).toISOString() : "",
    activateAt: link.activateAt ? new Date(link.activateAt).toISOString() : "",
    utmSource: link.utmSource ?? "",
    utmMedium: link.utmMedium ?? "",
    utmCampaign: link.utmCampaign ?? "",
    utmTerm: link.utmTerm ?? "",
    utmContent: link.utmContent ?? "",
    iosDeepLink: link.iosDeepLink ?? "",
    androidDeepLink: link.androidDeepLink ?? "",
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            nativeButton={false}
            render={<Link href="/links" aria-label="Back to links" />}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              {link.title || `/${link.slug}`}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() =>
                  toggleFavorite.mutate({
                    id: link.id,
                    favorite: !link.isFavorite,
                  })
                }
                aria-label="Toggle favorite"
              >
                <Star
                  className={cn(
                    "h-4 w-4",
                    link.isFavorite && "fill-yellow-400 text-yellow-400",
                  )}
                />
              </Button>
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-primary">/{link.slug}</span>
              <span>→</span>
              <span className="max-w-[240px] truncate">{link.destination}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={copy}>
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
          <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {link.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {link.tags.map((t) => (
            <Badge key={t.id} variant="secondary">
              {t.name}
            </Badge>
          ))}
        </div>
      )}

      <Tabs defaultValue="analytics">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="qr">
            <QrCode className="mr-1 h-4 w-4" />
            QR code
          </TabsTrigger>
        </TabsList>
        <TabsContent value="analytics" className="pt-2">
          <LinkAnalytics linkId={link.id} slug={link.slug} />
        </TabsContent>
        <TabsContent value="edit" className="pt-2">
          <div className="max-w-2xl">
            <LinkForm
              defaultValues={formValues}
              folders={folders.data ?? []}
              tags={tags.data ?? []}
              isSubmitting={updateLink.isPending}
              submitLabel="Save changes"
              hasExistingPassword={!!link.passwordHash}
              onSubmit={(values) =>
                updateLink.mutate({ id: link.id, values })
              }
            />
          </div>
        </TabsContent>
        <TabsContent value="qr" className="pt-2">
          <QrTab linkId={link.id} slug={link.slug} />
        </TabsContent>
      </Tabs>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this link?</AlertDialogTitle>
            <AlertDialogDescription>
              /{link.slug} will be moved to the trash and stop redirecting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteLinks.mutate([link.id], {
                  onSuccess: () => router.push("/links"),
                })
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}