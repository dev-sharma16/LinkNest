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
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  GripVertical,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { fetchJson, useBioBlocks } from "@/hooks/use-bio";
import { getBlockMeta } from "@/lib/bio-blocks";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BlockConfigForm } from "@/components/bio/block-config-form";
import { BlockPickerDialog } from "@/components/bio/block-picker-dialog";
import { toast } from "sonner";
import type { BioBlock } from "@/hooks/use-bio";
import type { BlockType } from "@/lib/validations/bio";

const BLOCKS_KEY = ["bio-blocks"] as const;

export function BlockEditor() {
  const qc = useQueryClient();
  const { data: blocks, isLoading } = useBioBlocks();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const patchLocal = (patch: (block: BioBlock) => BioBlock, id: string) => {
    qc.setQueryData<BioBlock[]>(BLOCKS_KEY, (prev = []) =>
      prev.map((b) => (b.id === id ? patch(b) : b)),
    );
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const createMutation = useMutation({
    mutationFn: (type: BlockType) =>
      fetchJson<BioBlock>("/api/bio/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bio-blocks"] });
      setPickerOpen(false);
      toast.success("Block added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      fetchJson<BioBlock>(`/api/bio/blocks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bio-blocks"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetchJson<{ ok: true }>(`/api/bio/blocks/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bio-blocks"] });
      toast.success("Block deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) =>
      fetchJson<BioBlock>(`/api/bio/blocks/${id}/duplicate`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bio-blocks"] });
      toast.success("Block duplicated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !blocks) return;
    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = [...blocks];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved);
    qc.setQueryData<BioBlock[]>(BLOCKS_KEY, next);
    try {
      await fetchJson("/api/bio/blocks/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: next.map((b) => b.id) }),
      });
      qc.invalidateQueries({ queryKey: ["bio-blocks"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to reorder");
      qc.invalidateQueries({ queryKey: ["bio-blocks"] });
    }
  }

  function onConfigChange(id: string, config: Record<string, unknown>) {
    patchLocal((b) => ({ ...b, config }), id);
    updateMutation.mutate({ id, body: { config } });
  }

  function toggleHidden(id: string, hidden: boolean) {
    patchLocal((b) => ({ ...b, hidden }), id);
    updateMutation.mutate({ id, body: { hidden } });
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {(blocks?.length ?? 0)} block{blocks?.length === 1 ? "" : "s"}
        </p>
        <Button onClick={() => setPickerOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add block
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : !blocks?.length ? (
        <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
          No blocks yet. Add your first block to build your page.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            <div className="grid gap-2">
              {blocks.map((b) => (
                <SortableBlock
                  key={b.id}
                  block={b}
                  expanded={expanded === b.id}
                  onToggle={() => setExpanded((cur) => (cur === b.id ? null : b.id))}
                  onConfigChange={onConfigChange}
                  onDelete={() => deleteMutation.mutate(b.id)}
                  onDuplicate={() => duplicateMutation.mutate(b.id)}
                  onToggleHidden={toggleHidden}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <BlockPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(type) => createMutation.mutate(type)}
      />
    </div>
  );
}

function SortableBlock({
  block,
  expanded,
  onToggle,
  onConfigChange,
  onDelete,
  onDuplicate,
  onToggleHidden,
}: {
  block: BioBlock;
  expanded: boolean;
  onToggle: () => void;
  onConfigChange: (id: string, config: Record<string, unknown>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleHidden: (id: string, hidden: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const meta = getBlockMeta(block.type);
  const label =
    (typeof block.config?.label === "string" && block.config.label) ||
    (typeof block.config?.title === "string" && block.config.title) ||
    meta.label;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-lg border bg-card ${isDragging ? "opacity-60" : ""} ${block.hidden ? "opacity-50" : ""}`}
    >
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          type="button"
          className="cursor-grab text-muted-foreground active:cursor-grabbing"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button type="button" onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-2 text-left">
          <span className="text-sm font-medium">{label}</span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
            {meta.category}
          </span>
          {block.hidden && <span className="text-xs text-muted-foreground">hidden</span>}
        </button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onToggleHidden(block.id, !block.hidden)} aria-label="Toggle visibility">
          {block.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDuplicate} aria-label="Duplicate">
          <Copy className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onDelete} aria-label="Delete">
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggle} aria-label="Expand">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      {expanded && (
        <div className="border-t p-4">
          <BlockConfigForm
            type={block.type}
            config={block.config ?? {}}
            onChange={(config) => onConfigChange(block.id, config)}
          />
        </div>
      )}
    </div>
  );
}