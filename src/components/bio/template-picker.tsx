"use client";

import { useState } from "react";
import { Palette, Save, Sparkles } from "lucide-react";
import type { SavedTemplate } from "@/hooks/use-templates";
import type { ThemePreset } from "@/lib/bio-themes";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TemplateGallery } from "@/components/bio/template-gallery";
import {
  SaveTemplateDialog,
  SavedTemplateSection,
} from "@/components/bio/saved-templates";

/**
 * The "Choose a template" block. A tab toggle switches between the built-in
 * presets, the user's saved (custom) templates, and AI-generated presets,
 * so all stay one screen tall instead of stacking into a long scroll.
 */
export function TemplatePicker({
  presets,
  activeId,
  onSelectPreset,
  variant = "bio",
  description,
  saveDescription,
  saved,
  savedLoading,
  savedSaveBusy,
  currentAppearance,
  onApplySaved,
  onRenameSaved,
  onDeleteSaved,
  onSaveCurrent,
}: {
  presets: ThemePreset[];
  activeId: string;
  onSelectPreset: (id: string) => void;
  variant?: "bio" | "storefront";
  description: string;
  saveDescription: string;
  saved: SavedTemplate[];
  savedLoading: boolean;
  savedSaveBusy: boolean;
  currentAppearance: Record<string, unknown>;
  onApplySaved: (template: SavedTemplate) => void;
  onRenameSaved: (
    id: string,
    name: string,
    appearance?: Record<string, unknown>,
  ) => void | Promise<void>;
  onDeleteSaved: (id: string) => void;
  onSaveCurrent: (name: string) => void | Promise<void>;
}) {
  // Land on "My templates" when the active look is a saved template, so the
  // highlight is visible without the user having to switch tabs.
  const defaultTab = activeId.startsWith("saved:")
    ? saved.some((s) => s.source === "ai" && `saved:${s.id}` === activeId)
      ? "ai"
      : "saved"
    : "presets";
  const [tab, setTab] = useState<"presets" | "saved" | "ai">(defaultTab);
  const [saveOpen, setSaveOpen] = useState(false);

  const manualTemplates = saved.filter((s) => s.source !== "ai");
  const aiTemplates = saved.filter((s) => s.source === "ai");

  async function handleSaveCurrent(name: string) {
    await onSaveCurrent(name);
    // Jump to the saved tab so the new template is visible right away.
    setTab("saved");
  }

  return (
    <>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold">Choose a template</h2>
        </div>
        <Button variant="outline" size="sm" onClick={() => setSaveOpen(true)}>
          <Save className="mr-1.5 h-4 w-4" />
          Save current as template
        </Button>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">{description}</p>

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as "presets" | "saved" | "ai")}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="saved">
            My templates
            {!savedLoading && manualTemplates.length > 0 ? (
              <span className="ml-1 rounded-full bg-primary/10 px-1.5 text-[11px] font-semibold text-primary">
                {manualTemplates.length}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Sparkles className="mr-1 h-3 w-3" />
            AI Generated
            {!savedLoading && aiTemplates.length > 0 ? (
              <span className="ml-1 rounded-full bg-primary/10 px-1.5 text-[11px] font-semibold text-primary">
                {aiTemplates.length}
              </span>
            ) : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="presets">
          <TemplateGallery
            presets={presets}
            activeId={activeId}
            onSelect={onSelectPreset}
            variant={variant}
          />
        </TabsContent>

        <TabsContent value="saved">
          <SavedTemplateSection
            saved={manualTemplates}
            loading={savedLoading}
            activeId={activeId}
            variant={variant}
            currentAppearance={currentAppearance}
            onApply={onApplySaved}
            onRename={onRenameSaved}
            onDelete={onDeleteSaved}
          />
        </TabsContent>

        <TabsContent value="ai">
          <SavedTemplateSection
            saved={aiTemplates}
            loading={savedLoading}
            activeId={activeId}
            variant={variant}
            currentAppearance={currentAppearance}
            onApply={onApplySaved}
            onRename={onRenameSaved}
            onDelete={onDeleteSaved}
          />
        </TabsContent>
      </Tabs>

      <SaveTemplateDialog
        key={saveOpen ? "create" : "closed"}
        open={saveOpen}
        onOpenChange={setSaveOpen}
        title="Save as template"
        description={saveDescription}
        defaultName="My template"
        busy={savedSaveBusy}
        onSubmit={handleSaveCurrent}
      />
    </>
  );
}
