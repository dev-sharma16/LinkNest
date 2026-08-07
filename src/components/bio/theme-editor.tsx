"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, RotateCcw } from "lucide-react";
import { fetchJson } from "@/hooks/use-bio";
import { useSavedTemplates, type SavedTemplate } from "@/hooks/use-templates";
import { TemplatePicker } from "@/components/bio/template-picker";
import { DEFAULT_THEME, THEME_PRESETS, applyPresetToTheme } from "@/lib/bio-themes";
import type { ThemeStyleValues } from "@/lib/validations/bio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhonePreview } from "@/components/bio/template-gallery";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function ThemeEditor({ initial }: { initial: Record<string, unknown> | null }) {
  const qc = useQueryClient();
  const [theme, setTheme] = useState<ThemeStyleValues>({
    ...DEFAULT_THEME,
    ...(initial ?? {}),
  });
  const savedTemplates = useSavedTemplates("bio");

  const saveMutation = useMutation({
    mutationFn: (body: ThemeStyleValues) =>
      fetchJson<{ ok: true }>("/api/bio/appearance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bio-profile"] });
      toast.success("Theme saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function applyPreset(presetId: string) {
    setTheme(applyPresetToTheme(theme, presetId));
    toast.success("Template applied — fine-tune below");
  }

  function applySavedTemplate(template: SavedTemplate) {
    setTheme((t) => ({
      ...t,
      ...(template.appearance as Partial<ThemeStyleValues>),
      preset: `saved:${template.id}`,
    }));
    toast.success(`"${template.name}" applied — fine-tune below`);
  }

  function handleSaveAsTemplate(name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      savedTemplates.create.mutate(
        { name, appearance: theme as Record<string, unknown> },
        {
          onSuccess: () => {
            toast.success(`"${name}" saved to My templates`);
            resolve();
          },
          onError: (e: Error) => {
            toast.error(e.message);
            reject(e);
          },
        },
      );
    });
  }

  function handleRenameTemplate(
    id: string,
    name: string,
    appearance?: Record<string, unknown>,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      savedTemplates.update.mutate(
        { id, name, appearance },
        {
          onSuccess: () => {
            toast.success("Template updated");
            resolve();
          },
          onError: (e: Error) => {
            toast.error(e.message);
            reject(e);
          },
        },
      );
    });
  }

  function handleDeleteTemplate(id: string) {
    savedTemplates.remove.mutate(id, {
      onSuccess: () => toast.success("Template deleted"),
      onError: (e: Error) => toast.error(e.message),
    });
  }

  function set<K extends keyof ThemeStyleValues>(key: K, value: ThemeStyleValues[K]) {
    setTheme((t) => ({ ...t, [key]: value }));
  }

  const color = (key: keyof ThemeStyleValues) => (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={String(theme[key])}
        onChange={(e) => set(key, e.target.value as never)}
        className="h-9 w-12 cursor-pointer rounded border"
      />
      <Input value={String(theme[key])} onChange={(e) => set(key, e.target.value as never)} />
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-8">
        <section>
          <TemplatePicker
            presets={THEME_PRESETS}
            activeId={theme.preset}
            onSelectPreset={applyPreset}
            variant="bio"
            description="Pick a starting look, then fine-tune every detail below. Your content is never changed — only the styling."
            saveDescription="Save your current look to reuse on any bio page."
            saved={savedTemplates.list.data ?? []}
            savedLoading={savedTemplates.list.isLoading}
            savedSaveBusy={savedTemplates.create.isPending}
            currentAppearance={theme as Record<string, unknown>}
            onApplySaved={applySavedTemplate}
            onRenameSaved={handleRenameTemplate}
            onDeleteSaved={handleDeleteTemplate}
            onSaveCurrent={handleSaveAsTemplate}
          />
        </section>

        <section className="grid gap-6 rounded-xl border bg-card p-5">
          <div>
            <Label className="mb-2 block">Theme</Label>
            <Select value={theme.themeName} onValueChange={(v) => set("themeName", v as never)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">Colors</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Primary">{color("primaryColor")}</Field>
              <Field label="Secondary">{color("secondaryColor")}</Field>
              <Field label="Accent">{color("accentColor")}</Field>
              <Field label="Text">{color("textColor")}</Field>
              <Field label="Background">{color("backgroundColor")}</Field>
              <Field label="Button background">{color("buttonBackground")}</Field>
              <Field label="Button text">{color("buttonText")}</Field>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Fonts</Label>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Family">
                <Input value={theme.fontFamily} onChange={(e) => set("fontFamily", e.target.value)} placeholder="Inter, sans-serif" />
              </Field>
              <Field label="Size">
                <Input value={theme.fontSize} onChange={(e) => set("fontSize", e.target.value)} placeholder="16px" />
              </Field>
              <Field label="Weight">
                <Input value={theme.fontWeight} onChange={(e) => set("fontWeight", e.target.value)} placeholder="500" />
              </Field>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Background</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Type">
                <Select value={theme.backgroundType} onValueChange={(v) => set("backgroundType", v as never)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid</SelectItem>
                    <SelectItem value="gradient">Gradient</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              {theme.backgroundType === "gradient" && (
                <>
                  <Field label="Gradient from">{color("gradientFrom")}</Field>
                  <Field label="Gradient to">{color("gradientTo")}</Field>
                </>
              )}
              {theme.backgroundType === "image" && (
                <Field label="Image URL">
                  <Input value={String(theme.backgroundImage ?? "")} onChange={(e) => set("backgroundImage", e.target.value as never)} placeholder="https://" />
                </Field>
              )}
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Layout</Label>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Button style">
                <Select value={theme.buttonStyle} onValueChange={(v) => set("buttonStyle", v as never)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid</SelectItem>
                    <SelectItem value="outline">Outline</SelectItem>
                    <SelectItem value="ghost">Ghost</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Button radius">
                <Input value={theme.buttonRadius} onChange={(e) => set("buttonRadius", e.target.value)} placeholder="12px" />
              </Field>
              <Field label="Card style">
                <Select value={theme.cardStyle} onValueChange={(v) => set("cardStyle", v as never)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat</SelectItem>
                    <SelectItem value="outlined">Outlined</SelectItem>
                    <SelectItem value="shadow">Shadow</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Block spacing">
                <Input value={theme.blockSpacing} onChange={(e) => set("blockSpacing", e.target.value)} placeholder="12px" />
              </Field>
              <Field label="Alignment">
                <Select value={theme.alignment} onValueChange={(v) => set("alignment", v as never)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Custom CSS (Pro)</Label>
            <Textarea
              value={theme.customCss ?? ""}
              onChange={(e) => set("customCss", e.target.value as never)}
              rows={4}
              placeholder="/* optional custom styles */"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => saveMutation.mutate(theme)} disabled={saveMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {saveMutation.isPending ? "Saving…" : "Save theme"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setTheme({ ...DEFAULT_THEME })}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </section>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Label className="mb-2 block text-center">Live preview</Label>
        <div className="rounded-xl border bg-gradient-to-b from-muted/60 to-muted/20 p-4">
          <PhonePreview theme={theme} variant="bio" />
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Updates instantly as you customize.
        </p>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}