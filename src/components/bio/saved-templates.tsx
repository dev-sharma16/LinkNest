"use client";

import { useState } from "react";
import { Bookmark, Check, MoreHorizontal, Pencil, Trash2, Copy, Sparkles } from "lucide-react";
import type { SavedTemplate } from "@/hooks/use-templates";
import { DEFAULT_THEME } from "@/lib/bio-themes";
import type { ThemeStyleValues } from "@/lib/validations/bio";
import { cn } from "@/lib/utils";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhonePreview } from "@/components/bio/template-gallery";

/**
 * A small name dialog used to create a new saved template or rename an
 * existing one. Extra controls (e.g. "update with current look") can be
 * rendered between the name field and the footer via `children`.
 *
 * The dialog only closes once `onSubmit` resolves; returning a rejected
 * promise (e.g. a failed save) keeps it open so the user can fix the input.
 */
export function SaveTemplateDialog({
  open,
  onOpenChange,
  title,
  description,
  defaultName = "",
  submitLabel = "Save template",
  busy = false,
  children,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  defaultName?: string;
  submitLabel?: string;
  busy?: boolean;
  children?: React.ReactNode;
  onSubmit: (name: string) => void | Promise<void>;
}) {
  const [name, setName] = useState(defaultName);

  const trimmed = name.trim();
  const canSubmit = trimmed.length > 0 && !busy;

  async function submit() {
    if (!canSubmit) return;
    try {
      await onSubmit(trimmed);
      onOpenChange(false);
    } catch {
      // Keep the dialog open so the user can fix the input.
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="template-name">Template name</Label>
          <Input
            id="template-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. My brand look"
            maxLength={60}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") void submit();
            }}
          />
        </div>
        {children}
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={() => void submit()} disabled={!canSubmit}>
            {busy ? "Saving…" : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * A grid of the user's saved templates with live phone previews. Clicking a
 * card applies it; the kebab menu offers rename and delete.
 */
export function SavedTemplateSection({
  saved,
  loading = false,
  activeId,
  variant = "bio",
  currentAppearance,
  onApply,
  onRename,
  onDelete,
  onDuplicate,
}: {
  saved: SavedTemplate[];
  loading?: boolean;
  activeId: string;
  variant?: "bio" | "storefront";
  currentAppearance?: Record<string, unknown>;
  onApply: (template: SavedTemplate) => void;
  onRename: (
    id: string,
    name: string,
    appearance?: Record<string, unknown>,
  ) => void | Promise<void>;
  onDelete: (id: string) => void;
  onDuplicate?: (id: string) => void;
}) {
  const [renameTarget, setRenameTarget] = useState<SavedTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavedTemplate | null>(null);
  const [updateLook, setUpdateLook] = useState(true);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex animate-pulse flex-col items-center gap-2 rounded-xl border bg-card p-3 pb-2"
          >
            <div className="aspect-[9/16] w-full max-w-[150px] rounded-[1.2rem] bg-muted" />
            <div className="mt-1 h-3 w-2/3 rounded-full bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (saved.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-card/50 px-6 py-8 text-center">
        <Bookmark className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
        <p className="text-sm font-medium">No saved templates yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Fine-tune a look above, then save it here to reuse on any page.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {saved.map((template) => {
          const active = activeId === `saved:${template.id}`;
          // Saved templates store a full theme, so merging with the defaults
          // guarantees previews render even if a field is missing.
          const theme = {
            ...DEFAULT_THEME,
            ...template.appearance,
          } as ThemeStyleValues;
          return (
            <div key={template.id} className="relative">
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onApply(template)}
                className={cn(
                  "group flex w-full cursor-pointer flex-col items-center gap-2 rounded-xl border bg-card p-3 pb-2 text-center transition-all duration-200 outline-none",
                  active
                    ? "border-primary shadow-md ring-2 ring-primary/60"
                    : "border-border hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md",
                )}
              >
                {active ? (
                  <span className="absolute left-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </span>
                ) : null}
                <PhonePreview
                  theme={theme}
                  variant={variant}
                  className="w-full max-w-[150px]"
                />
                <span className="mt-1 text-sm font-semibold">{template.name}</span>
                <span className="hidden text-[11px] leading-tight text-muted-foreground sm:block">
                  {template.source === "ai" ? (
                    <span className="flex items-center justify-center gap-1">
                      <Sparkles className="h-2.5 w-2.5" />
                      AI Generated
                    </span>
                  ) : (
                    "Custom template"
                  )}
                </span>
                {template.compatibility && template.compatibility !== "both" && (
                  <span className="text-[10px] text-muted-foreground/70">
                    {template.compatibility === "link_in_bio" ? "Bio only" : "Storefront only"}
                  </span>
                )}
              </button>

              {/* Sibling of the card button, so no interactive element nesting. */}
              <div
                className="absolute right-1 top-1 z-20"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Template actions"
                      />
                    }
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Template actions</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setUpdateLook(true);
                        setRenameTarget(template);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    {onDuplicate && (
                      <DropdownMenuItem
                        onClick={() => onDuplicate(template.id)}
                      >
                        <Copy className="h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setDeleteTarget(template)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>

      <SaveTemplateDialog
        key={renameTarget?.id ?? "closed"}
        open={renameTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRenameTarget(null);
        }}
        title="Edit template"
        description={
          renameTarget
            ? `Rename or update the look of “${renameTarget.name}”.`
            : undefined
        }
        defaultName={renameTarget?.name ?? ""}
        submitLabel="Save changes"
        onSubmit={(name) => {
          if (!renameTarget) return;
          return onRename(
            renameTarget.id,
            name,
            updateLook ? currentAppearance : undefined,
          );
        }}
      >
        {currentAppearance ? (
          <label className="flex cursor-pointer items-start gap-2 rounded-lg border bg-muted/40 p-2.5 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={updateLook}
              onChange={(e) => setUpdateLook(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              Also update this template with my current look{" "}
              <span className="font-semibold text-foreground">(recommended)</span>
            </span>
          </label>
        ) : null}
      </SaveTemplateDialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete template?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? (
                <>
                  <span className="font-medium text-foreground">
                    {deleteTarget.name}
                  </span>{" "}
                  will be permanently removed. This cannot be undone.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (deleteTarget) onDelete(deleteTarget.id);
                setDeleteTarget(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
