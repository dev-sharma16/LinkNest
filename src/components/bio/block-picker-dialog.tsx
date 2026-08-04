"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BLOCK_LIST, BLOCK_CATEGORIES } from "@/lib/bio-blocks";
import type { BlockType } from "@/lib/validations/bio";

export function BlockPickerDialog({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: BlockType) => void;
}) {
  const [category, setCategory] = useState<string>("core");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a block</DialogTitle>
          <DialogDescription>
            Pick a block to add to your page.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-1.5">
          {BLOCK_CATEGORIES.map((c) => (
            <Button
              key={c.id}
              type="button"
              variant={category === c.id ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setCategory(c.id)}
            >
              {c.label}
            </Button>
          ))}
        </div>
        <div className="grid max-h-[50vh] grid-cols-2 gap-2 overflow-y-auto">
          {BLOCK_LIST.filter((b) => b.category === category).map((b) => (
            <button
              key={b.type}
              type="button"
              onClick={() => onSelect(b.type)}
              className="rounded-lg border p-3 text-left transition-colors hover:bg-muted"
            >
              <p className="text-sm font-medium">{b.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {b.description}
              </p>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}