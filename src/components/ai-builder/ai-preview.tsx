"use client";

import { useState } from "react";
import {
  Check,
  Sparkles,
  Wand2,
  Palette,
  LayoutGrid,
  Type,
  Save,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import type { AIDesignSpecification } from "@/lib/validations/ai-builder";
import { DEFAULT_THEME } from "@/lib/bio-themes";
import type { ThemeStyleValues } from "@/lib/validations/bio";
import { PhonePreview } from "@/components/bio/template-gallery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function AIPreview({
  designSpec,
  onApply,
  onDiscard,
  onRegenerate,
  onSaveAsPreset,
  isApplying,
  isSaving,
  className,
}: {
  designSpec: AIDesignSpecification;
  onApply: () => void;
  onDiscard: () => void;
  onRegenerate: (prompt: string) => void;
  onSaveAsPreset: (name: string, description: string) => void;
  isApplying?: boolean;
  isSaving?: boolean;
  className?: string;
}) {
  const [regenPrompt, setRegenPrompt] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState(
    designSpec.metadata?.suggestedName ?? "",
  );
  const [presetDescription, setPresetDescription] = useState(
    designSpec.metadata?.suggestedDescription ?? "",
  );

  const theme = {
    ...DEFAULT_THEME,
    ...(designSpec.theme ?? {}),
  } as ThemeStyleValues;

  const blockCount = designSpec.blocks?.length ?? 0;
  const socialCount = designSpec.socialLinks?.length ?? 0;
  const productCount = designSpec.storefront?.products?.length ?? 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Generated Design</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onDiscard}>
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back
        </Button>
      </div>

      {/* Preview + Details */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Phone preview */}
        <div className="flex justify-center">
          <PhonePreview theme={theme} className="w-full max-w-[200px]" />
        </div>

        {/* Design details */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold">
              {designSpec.metadata?.suggestedName || "AI Generated Design"}
            </h3>
            {designSpec.metadata?.suggestedDescription && (
              <p className="text-xs text-muted-foreground">
                {designSpec.metadata.suggestedDescription}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {designSpec.theme?.themeName && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Palette className="h-3 w-3" />
                {designSpec.theme.themeName}
              </Badge>
            )}
            {blockCount > 0 && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <LayoutGrid className="h-3 w-3" />
                {blockCount} blocks
              </Badge>
            )}
            {socialCount > 0 && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Type className="h-3 w-3" />
                {socialCount} social links
              </Badge>
            )}
            {productCount > 0 && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <LayoutGrid className="h-3 w-3" />
                {productCount} products
              </Badge>
            )}
          </div>

          {/* Theme preview */}
          {designSpec.theme && (
            <div className="rounded-lg border p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Theme
              </p>
              <div className="flex gap-2">
                <div
                  className="h-6 w-6 rounded-full border"
                  style={{ background: designSpec.theme.primaryColor }}
                  title="Primary"
                />
                <div
                  className="h-6 w-6 rounded-full border"
                  style={{ background: designSpec.theme.secondaryColor }}
                  title="Secondary"
                />
                <div
                  className="h-6 w-6 rounded-full border"
                  style={{ background: designSpec.theme.accentColor }}
                  title="Accent"
                />
                <div
                  className="h-6 w-6 rounded-full border"
                  style={{ background: designSpec.theme.backgroundColor }}
                  title="Background"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Regeneration input */}
      <div className="space-y-2">
        <Label htmlFor="preview-regen">Want changes? Describe what to update.</Label>
        <div className="flex gap-2">
          <Input
            id="preview-regen"
            placeholder="e.g. Make it lighter, add more sections, change buttons to outline..."
            value={regenPrompt}
            onChange={(e) => setRegenPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && regenPrompt.trim()) {
                onRegenerate(regenPrompt);
                setRegenPrompt("");
              }
            }}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (regenPrompt.trim()) {
                onRegenerate(regenPrompt);
                setRegenPrompt("");
              }
            }}
            disabled={!regenPrompt.trim()}
          >
            <Wand2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={onApply} disabled={isApplying}>
          {isApplying ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          Apply to Page
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowSaveDialog(true)}
        >
          <Save className="mr-2 h-4 w-4" />
          Save as Preset
        </Button>
        <Button variant="ghost" onClick={onDiscard}>
          Discard
        </Button>
      </div>

      {/* Save as preset dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Custom Preset</DialogTitle>
            <DialogDescription>
              Save this AI-generated design as a reusable preset.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="preset-name">Name</Label>
              <Input
                id="preset-name"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="e.g. Fitness Dark Theme"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preset-desc">Description</Label>
              <Textarea
                id="preset-desc"
                value={presetDescription}
                onChange={(e) => setPresetDescription(e.target.value)}
                placeholder="Brief description of this preset"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                onSaveAsPreset(presetName, presetDescription);
                setShowSaveDialog(false);
              }}
              disabled={!presetName.trim() || isSaving}
            >
              {isSaving ? "Saving..." : "Save Preset"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
