"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, RotateCcw } from "lucide-react";
import { fetchJson } from "@/hooks/use-storefronts";
import { STOREFRONT_DEFAULT_THEME, STOREFRONT_PRESETS } from "@/lib/storefront-themes";
import type { StorefrontAppearanceValues } from "@/lib/validations/storefront";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function StorefrontAppearanceEditor({
  storefrontId,
  initial,
}: {
  storefrontId: string;
  initial: Record<string, unknown> | null;
}) {
  const qc = useQueryClient();
  const [theme, setTheme] = useState<StorefrontAppearanceValues>({
    ...STOREFRONT_DEFAULT_THEME,
    ...(initial ?? {}),
  });

  const saveMutation = useMutation({
    mutationFn: (body: StorefrontAppearanceValues) =>
      fetchJson<{ ok: true }>(`/api/storefronts/${storefrontId}/appearance`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["storefronts", storefrontId] });
      toast.success("Appearance saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function applyPreset(presetId: string) {
    const preset = STOREFRONT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setTheme((t) => ({
      ...t,
      ...preset.style,
      preset: presetId,
    }));
  }

  function set<K extends keyof StorefrontAppearanceValues>(
    key: K,
    value: StorefrontAppearanceValues[K],
  ) {
    setTheme((t) => ({ ...t, [key]: value }));
  }

  const color = (key: keyof StorefrontAppearanceValues) => (
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
    <div className="grid max-w-2xl gap-6">
      <div>
        <Label className="mb-2 block">Presets</Label>
        <div className="flex flex-wrap gap-2">
          {STOREFRONT_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              className={`rounded-lg border px-3 py-2 text-sm ${theme.preset === p.id ? "ring-2 ring-primary" : "hover:bg-muted"}`}
            >
              <span
                className="mr-2 inline-block h-3 w-3 rounded-full"
                style={{ background: p.style.primaryColor }}
              />
              {p.name}
            </button>
          ))}
        </div>
      </div>

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
        <Label className="mb-2 block">Typography</Label>
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
        <Label className="mb-2 block">Layout</Label>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Product layout">
            <Select value={theme.layout} onValueChange={(v) => set("layout", v as never)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid</SelectItem>
                <SelectItem value="list">List</SelectItem>
              </SelectContent>
            </Select>
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
          <Field label="Card radius">
            <Input value={theme.cardRadius} onChange={(e) => set("cardRadius", e.target.value)} placeholder="16px" />
          </Field>
          <Field label="Card shadow">
            <Select value={theme.cardShadow} onValueChange={(v) => set("cardShadow", v as never)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="md">Medium</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
              </SelectContent>
            </Select>
          </Field>
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
          <Field label="Product spacing">
            <Input value={theme.productSpacing} onChange={(e) => set("productSpacing", e.target.value)} placeholder="16px" />
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
              <Input
                value={String(theme.backgroundImage ?? "")}
                onChange={(e) => set("backgroundImage", e.target.value as never)}
                placeholder="https://"
              />
            </Field>
          )}
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Custom CSS</Label>
        <Textarea
          value={theme.customCss ?? ""}
          onChange={(e) => set("customCss", e.target.value as never)}
          rows={4}
          placeholder="/* optional custom styles */"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={() => saveMutation.mutate(theme)} disabled={saveMutation.isPending}>
          <Save className="mr-2 h-4 w-4" />
          {saveMutation.isPending ? "Saving…" : "Save appearance"}
        </Button>
        <Button variant="outline" onClick={() => setTheme({ ...STOREFRONT_DEFAULT_THEME })}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>
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
