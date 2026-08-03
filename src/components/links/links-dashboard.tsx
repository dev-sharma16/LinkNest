"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  useQuery,
} from "@tanstack/react-query";
import {
  Plus,
  Search,
  Star,
  Archive,
  Copy,
  MoreHorizontal,
  Pencil,
  Trash2,
  QrCode,
  ChevronLeft,
  ChevronRight,
  FolderPlus,
  Tag as TagIcon,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  useLinks,
  useFolders,
  useTags,
  type LinkQuery,
  type LinkItem,
} from "@/hooks/use-links";
import {
  useCreateLink,
  useDeleteLinks,
  useToggleFavorite,
  useArchiveLinks,
  useCreateFolder,
  useCreateTag,
} from "@/hooks/use-link-mutations";
import { LinkForm } from "@/components/links/link-form";
import { QrDialog } from "@/components/links/qr-dialog";

export function LinksDashboard() {
  const [query, setQuery] = useState<LinkQuery>({ page: 1, pageSize: 12 });
  const [searchInput, setSearchInput] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [qrLink, setQrLink] = useState<LinkItem | null>(null);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newTagOpen, setNewTagOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [tagName, setTagName] = useState("");

  const links = useLinks(query);
  const folders = useFolders();
  const tags = useTags();

  const createLink = useCreateLink(() => {
    setCreateOpen(false);
  });
  const deleteLinks = useDeleteLinks();
  const toggleFavorite = useToggleFavorite();
  const archiveLinks = useArchiveLinks();
  const createFolder = useCreateFolder(() => {
    setNewFolderOpen(false);
    setFolderName("");
  });
  const createTag = useCreateTag(() => {
    setNewTagOpen(false);
    setTagName("");
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setQuery((q) => ({ ...q, search: searchInput || undefined, page: 1 }));
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const items = links.data?.items ?? [];
  const totalPages = links.data?.totalPages ?? 1;
  const page = links.data?.page ?? 1;

  function toggleSelect(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleSelectAll() {
    if (selected.length === items.length && items.length > 0) {
      setSelected([]);
    } else {
      setSelected(items.map((i) => i.id));
    }
  }

  function copyLink(item: LinkItem) {
    navigator.clipboard.writeText(item.shortUrl);
    toast.success("Link copied to clipboard");
  }

  function handleBulkDelete() {
    deleteLinks.mutate(selected, {
      onSuccess: () => setSelected([]),
    });
  }

  const showArchived = query.archived === true;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {showArchived ? "Archived links" : "Links"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Create, manage and analyze your short links.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create link
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search links…"
            className="pl-9"
          />
        </div>

        <Select
          value={query.folderId ?? "all"}
          onValueChange={(v) =>
            setQuery((q) => ({
              ...q,
              folderId: !v || v === "all" ? undefined : v,
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All folders" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All folders</SelectItem>
            {folders.data?.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={query.tagId ?? "all"}
          onValueChange={(v) =>
            setQuery((q) => ({
              ...q,
              tagId: !v || v === "all" ? undefined : v,
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tags</SelectItem>
            {tags.data?.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={query.sort ?? "createdAt"}
          onValueChange={(v) =>
            setQuery((q) => ({
              ...q,
              sort: v as LinkQuery["sort"],
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Newest first</SelectItem>
            <SelectItem value="clicks">Most clicks</SelectItem>
            <SelectItem value="title">Title A-Z</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={query.favorite ? "secondary" : "outline"}
          size="icon"
          onClick={() =>
            setQuery((q) => ({
              ...q,
              favorite: q.favorite ? undefined : true,
              page: 1,
            }))
          }
          aria-label="Favorites only"
          title="Favorites only"
        >
          <Star className="h-4 w-4" />
        </Button>
        <Button
          variant={showArchived ? "secondary" : "outline"}
          onClick={() =>
            setQuery((q) => ({
              ...q,
              archived: q.archived ? undefined : true,
              page: 1,
            }))
          }
        >
          <Archive className="mr-2 h-4 w-4" />
          Archived
        </Button>
      </div>

      {/* Bulk actions */}
      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2">
          <span className="text-sm text-muted-foreground">
            {selected.length} selected
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                archiveLinks.mutate({
                  ids: selected,
                  archived: !showArchived,
                }, { onSuccess: () => setSelected([]) })
              }
            >
              <Archive className="mr-2 h-4 w-4" />
              {showArchived ? "Unarchive" : "Archive"}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      {links.isLoading ? (
        <div className="grid gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          hasFilters={!!(query.search || query.folderId || query.tagId || query.favorite || query.archived)}
        />
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={selected.length === items.length && items.length > 0}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="w-10" />
                <TableHead>Link</TableHead>
                <TableHead className="w-20 text-right">Clicks</TableHead>
                <TableHead className="hidden lg:table-cell">Folder</TableHead>
                <TableHead className="hidden md:table-cell">Created</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow
                  key={item.id}
                  className={cn(
                    item.isArchived && "opacity-60",
                  )}
                >
                  <TableCell>
                    <Checkbox
                      checked={selected.includes(item.id)}
                      onCheckedChange={() => toggleSelect(item.id)}
                      aria-label={`Select ${item.slug}`}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        toggleFavorite.mutate({
                          id: item.id,
                          favorite: !item.isFavorite,
                        })
                      }
                      aria-label="Toggle favorite"
                    >
                      <Star
                        className={cn(
                          "h-4 w-4",
                          item.isFavorite &&
                            "fill-yellow-400 text-yellow-400",
                        )}
                      />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/links/${item.id}`}
                          className="truncate font-medium text-primary hover:underline"
                        >
                          {item.title || `/${item.slug}`}
                        </Link>
                        {item.isArchived && (
                          <Badge variant="secondary">Archived</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                        <span className="truncate">{item.destination}</span>
                      </div>
                      {item.tags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {item.tags.map((t) => (
                            <Badge key={t.id} variant="outline" className="px-1.5 text-[10px]">
                              {t.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {item.clickCount.toLocaleString()}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {item.folder?.name ?? "—"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {formatDate(item.createdAt)}
                  </TableCell>
                  <TableCell>
                    <RowMenu
                      item={item}
                      onCopy={() => copyLink(item)}
                      onQr={() => setQrLink(item)}
                      onDelete={() => deleteLinks.mutate([item.id])}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={page <= 1}
              onClick={() => setQuery((q) => ({ ...q, page: page - 1 }))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages}
              onClick={() => setQuery((q) => ({ ...q, page: page + 1 }))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create link dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create a new link</DialogTitle>
            <DialogDescription>
              Shorten a URL and configure its options.
            </DialogDescription>
          </DialogHeader>
          <LinkForm
            folders={folders.data ?? []}
            tags={tags.data ?? []}
            isSubmitting={createLink.isPending}
            onSubmit={(values) => createLink.mutate(values)}
          />
        </DialogContent>
      </Dialog>

      {/* QR dialog */}
      {qrLink && (
        <QrDialog
          linkId={qrLink.id}
          slug={qrLink.slug}
          open={!!qrLink}
          onOpenChange={(open) => !open && setQrLink(null)}
        />
      )}

      {/* Delete confirm */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete selected links?</AlertDialogTitle>
            <AlertDialogDescription>
              {selected.length} link{selected.length === 1 ? "" : "s"} will be
              moved to the trash. This can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New folder dialog */}
      <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>New folder</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (folderName.trim()) createFolder.mutate(folderName.trim());
            }}
            className="grid gap-4"
          >
            <Input
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g. Marketing"
            />
            <Button type="submit" disabled={createFolder.isPending}>
              Create folder
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* New tag dialog */}
      <Dialog open={newTagOpen} onOpenChange={setNewTagOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>New tag</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (tagName.trim()) createTag.mutate(tagName.trim());
            }}
            className="grid gap-4"
          >
            <Input
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="e.g. campaign"
            />
            <Button type="submit" disabled={createTag.isPending}>
              Create tag
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Quick-add helpers */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Button variant="link" className="h-auto p-0" onClick={() => setNewFolderOpen(true)}>
          <FolderPlus className="mr-1 h-4 w-4" /> New folder
        </Button>
        <span>·</span>
        <Button variant="link" className="h-auto p-0" onClick={() => setNewTagOpen(true)}>
          <TagIcon className="mr-1 h-4 w-4" /> New tag
        </Button>
      </div>
    </div>
  );
}

function RowMenu({
  item,
  onCopy,
  onQr,
  onDelete,
}: {
  item: LinkItem;
  onCopy: () => void;
  onQr: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="h-8 w-8" />
        }
      >
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            /{item.slug}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onCopy}>
            <Copy className="mr-2 h-4 w-4" />
            Copy link
          </DropdownMenuItem>
          <DropdownMenuItem
            render={<Link href={`/links/${item.id}`} />}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Details & analytics
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onQr}>
            <QrCode className="mr-2 h-4 w-4" />
            QR code
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
      <Inbox className="h-10 w-10 text-muted-foreground" />
      <h3 className="mt-4 font-semibold">
        {hasFilters ? "No links match your filters" : "No links yet"}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {hasFilters
          ? "Try clearing your search or filters."
          : "Create your first short link to get started."}
      </p>
    </div>
  );
}