"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  GripVertical,
  Trash2,
  Copy,
  Star,
  ExternalLink,
  Pencil,
  Search,
  Loader2,
} from "lucide-react";
import { fetchJson, useProducts, type StorefrontProduct } from "@/hooks/use-storefronts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductFormDialog } from "@/components/storefronts/product-form";
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
import { toast } from "sonner";

const PRODUCTS_KEY_PREFIX = "storefront-products";

export function ProductEditor({ storefrontId }: { storefrontId: string }) {
  const qc = useQueryClient();
  const { data: products, isLoading } = useProducts(storefrontId);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<StorefrontProduct | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleting, setDeleting] = useState<StorefrontProduct | null>(null);

  const productsKey = [PRODUCTS_KEY_PREFIX, storefrontId] as const;
  const invalidate = () => qc.invalidateQueries({ queryKey: productsKey });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const toggleFeaturedMutation = useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) =>
      fetchJson(`/api/storefronts/${storefrontId}/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured }),
      }),
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetchJson<{ ok: true }>(`/api/storefronts/${storefrontId}/products/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      invalidate();
      setDeleting(null);
      toast.success("Product deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) =>
      fetchJson<StorefrontProduct>(`/api/storefronts/${storefrontId}/products/${id}/duplicate`, {
        method: "POST",
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Product duplicated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const bulkMutation = useMutation({
    mutationFn: ({ action, ids }: { action: "delete" | "feature" | "unfeature"; ids: string[] }) =>
      fetchJson(`/api/storefronts/${storefrontId}/products/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids }),
      }),
    onSuccess: () => {
      invalidate();
      setSelected(new Set());
      toast.success("Products updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !products) return;
    const oldIndex = products.findIndex((p) => p.id === active.id);
    const newIndex = products.findIndex((p) => p.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = [...products];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved);
    qc.setQueryData<StorefrontProduct[]>(productsKey, next);
    try {
      await fetchJson(`/api/storefronts/${storefrontId}/products/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: next.map((p) => p.id) }),
      });
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to reorder");
      invalidate();
    }
  }

  const filtered = (products ?? []).filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()),
  );

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {(products?.length ?? 0)} product{(products?.length ?? 0) === 1 ? "" : "s"}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-52 pl-8"
            />
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add product
          </Button>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/50 p-2">
          <span className="px-2 text-sm font-medium">
            {selected.size} selected
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={bulkMutation.isPending}
            onClick={() => bulkMutation.mutate({ action: "feature", ids: [...selected] })}
          >
            <Star className="mr-1.5 h-4 w-4" />
            Feature
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={bulkMutation.isPending}
            onClick={() => bulkMutation.mutate({ action: "unfeature", ids: [...selected] })}
          >
            Unfeature
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive"
            disabled={bulkMutation.isPending}
            onClick={() => bulkMutation.mutate({ action: "delete", ids: [...selected] })}
          >
            {bulkMutation.isPending ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-1.5 h-4 w-4" />
            )}
            Delete
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : !products?.length ? (
        <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
          No products yet. Add your first product card to start recommending.
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
          No products match your search.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext
            items={filtered.map((p) => p.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <SortableProductCard
                  key={p.id}
                  product={p}
                  selected={selected.has(p.id)}
                  onSelect={() => toggleOne(p.id)}
                  onToggleFeatured={() =>
                    toggleFeaturedMutation.mutate({ id: p.id, featured: !p.featured })
                  }
                  onEdit={() => setEditing(p)}
                  onDuplicate={() => duplicateMutation.mutate(p.id)}
                  onDelete={() => setDeleting(p)}
                  featuredBusy={
                    toggleFeaturedMutation.isPending &&
                    toggleFeaturedMutation.variables?.id === p.id
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <ProductFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        storefrontId={storefrontId}
      />
      <ProductFormDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        storefrontId={storefrontId}
        product={editing ?? undefined}
      />

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleting?.title}&rdquo; will be removed from your storefront.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleting && deleteMutation.mutate(deleting.id)}
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function SortableProductCard({
  product,
  selected,
  onSelect,
  onToggleFeatured,
  onEdit,
  onDuplicate,
  onDelete,
  featuredBusy,
}: {
  product: StorefrontProduct;
  selected: boolean;
  onSelect: () => void;
  onToggleFeatured: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  featuredBusy: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-xl border bg-card ${isDragging ? "opacity-60" : ""}`}
    >
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <button
          type="button"
          className="cursor-grab text-muted-foreground active:cursor-grabbing"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <Checkbox checked={selected} onCheckedChange={onSelect} aria-label={`Select ${product.title}`} />
        <button
          type="button"
          onClick={onToggleFeatured}
          disabled={featuredBusy}
          className={`rounded-md p-1 transition-colors ${
            product.featured ? "text-amber-500" : "text-muted-foreground hover:text-foreground"
          }`}
          aria-label={product.featured ? "Unfeature product" : "Feature product"}
        >
          {featuredBusy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Star className="h-4 w-4" fill={product.featured ? "currentColor" : "none"} />
          )}
        </button>
        <span className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Edit product"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Duplicate product"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
            aria-label="Delete product"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </span>
      </div>
      <div className="flex gap-3 p-3">
        {product.image ? (
          <img
            src={product.image}
            alt=""
            className="h-20 w-20 shrink-0 rounded-lg border object-cover"
            width={80}
            height={80}
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
            No image
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{product.title}</p>
          {product.description ? (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
              {product.description}
            </p>
          ) : null}
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            {safeHostname(product.url)}
          </a>
        </div>
      </div>
      {product.ctaText ? (
        <p className="border-t px-3 py-1.5 text-xs text-muted-foreground">
          CTA: {product.ctaText}
        </p>
      ) : null}
    </div>
  );
}
