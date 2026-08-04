"use client";

import { useState } from "react";
import { getBlockMeta, normalizeBlockConfig } from "@/lib/bio-blocks";
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
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { UploadButton } from "@/components/bio/upload-button";
import type { BlockType } from "@/lib/validations/bio";

export function BlockConfigForm({
  type,
  config,
  onChange,
}: {
  type: BlockType;
  config: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
}) {
  const meta = getBlockMeta(type);
  const [cfg, setCfg] = useState<Record<string, unknown>>(() =>
    normalizeBlockConfig(type, config),
  );

  function set(key: string, value: unknown) {
    const next = { ...cfg, [key]: value };
    setCfg(next);
    onChange(next);
  }

  function setImage(key: string) {
    return (url: string) => set(key, url);
  }

  const textField = (
    key: string,
    placeholder?: string,
  ) => (
    <Field label={key}>
      <Input
        value={String(cfg[key] ?? "")}
        placeholder={placeholder}
        onChange={(e) => set(key, e.target.value)}
      />
    </Field>
  );

  const textareaField = (key: string) => (
    <Field label={key}>
      <Textarea
        value={String(cfg[key] ?? "")}
        onChange={(e) => set(key, e.target.value)}
        rows={4}
      />
    </Field>
  );

  const urlField = (key = "url", placeholder?: string) => (
    <Field label={key}>
      <Input
        value={String(cfg[key] ?? "")}
        placeholder={placeholder ?? "https://"}
        onChange={(e) => set(key, e.target.value)}
      />
    </Field>
  );

  switch (type) {
    case "button":
      return (
        <div className="grid gap-3">
          {textField("label", "Button label")}
          {urlField("url")}
          <Field label="Style">
            <Select
              value={String(cfg.style ?? "solid")}
              onValueChange={(v) => set("style", v)}
            >
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
        </div>
      );

    case "link":
      return (
        <div className="grid gap-3">
          {textField("label", "Link label")}
          {urlField("url")}
        </div>
      );

    case "text":
      return (
        <div className="grid gap-3">
          {textareaField("content")}
          <Field label="Font size (px)">
            <Input
              type="number"
              value={Number(cfg.fontSize ?? 16)}
              onChange={(e) => set("fontSize", Number(e.target.value) || 16)}
            />
          </Field>
        </div>
      );

    case "heading":
      return (
        <div className="grid gap-3">
          {textField("content", "Heading text")}
          <Field label="Level">
            <Select
              value={String(cfg.level ?? "h2")}
              onValueChange={(v) => set("level", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="h1">H1</SelectItem>
                <SelectItem value="h2">H2</SelectItem>
                <SelectItem value="h3">H3</SelectItem>
                <SelectItem value="h4">H4</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      );

    case "divider":
      return (
        <div className="grid gap-3">
          <Field label="Color (optional)">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={String(cfg.color || "#888888")}
                onChange={(e) => set("color", e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border"
              />
              <Input value={String(cfg.color || "#888888")} onChange={(e) => set("color", e.target.value)} />
            </div>
          </Field>
        </div>
      );

    case "spacer":
      return (
        <Field label="Height (px)">
          <Input
            type="number"
            value={Number(cfg.height ?? 16)}
            onChange={(e) => set("height", Number(e.target.value) || 0)}
          />
        </Field>
      );

    case "image":
      return (
        <div className="grid gap-3">
          <Field label="Image">
            <ImageInput value={String(cfg.src ?? "")} onChange={setImage("src")} />
          </Field>
          {textField("alt", "Alt text")}
          {textField("caption", "Caption")}
        </div>
      );

    case "gallery":
      return (
        <div className="grid gap-3">
          <Field label="Images">
            <GalleryInput
              value={(cfg.images as string[]) ?? []}
              onChange={(images) => set("images", images)}
            />
          </Field>
        </div>
      );

    case "video":
      return (
        <div className="grid gap-3">
          <Field label="Video URL (mp4)">
            <ImageInput value={String(cfg.src ?? "")} onChange={setImage("src")} />
          </Field>
          {urlField("poster", "Poster image URL (optional)")}
        </div>
      );

    case "audio":
      return (
        <div className="grid gap-3">
          <Field label="Audio URL (mp3)">
            <ImageInput value={String(cfg.src ?? "")} onChange={setImage("src")} />
          </Field>
        </div>
      );

    case "custom_embed":
      return (
        <div className="grid gap-3">
          {urlField("url")}
          <Field label="Height (px)">
            <Input
              type="number"
              value={Number(cfg.height ?? 300)}
              onChange={(e) => set("height", Number(e.target.value) || 300)}
            />
          </Field>
        </div>
      );

    case "contact_form":
      return (
        <div className="grid gap-3">
          {textField("title", "Form title")}
          {textField("success", "Success message")}
        </div>
      );

    case "newsletter":
      return (
        <div className="grid gap-3">
          {textField("title", "Newsletter title")}
          {textField("success", "Success message")}
        </div>
      );

    case "html":
      return textareaField("content");

    case "file_download":
      return (
        <div className="grid gap-3">
          {textField("label", "Button label")}
          {urlField("url", "File URL")}
        </div>
      );

    case "pdf_viewer":
      return (
        <div className="grid gap-3">
          {urlField("url", "PDF URL")}
          <Field label="Height (px)">
            <Input
              type="number"
              value={Number(cfg.height ?? 500)}
              onChange={(e) => set("height", Number(e.target.value) || 500)}
            />
          </Field>
        </div>
      );

    // youtube, spotify, tiktok, instagram, twitter, twitch, vimeo, maps
    default:
      return (
        <div className="grid gap-3">
          {urlField("url", `Enter ${meta.label} URL`)}
          {type === "maps" ? textField("query", "Location query (optional)") : null}
        </div>
      );
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="capitalize text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function ImageInput({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [manual, setManual] = useState("");
  return (
    <div className="grid gap-2">
      <UploadButton value={value} onChange={onChange} />
      <div className="flex items-center gap-2">
        <Input
          value={manual || value}
          placeholder="…or paste an image URL"
          onChange={(e) => setManual(e.target.value)}
          onBlur={(e) => e.target.value && onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

function GalleryInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [url, setUrl] = useState("");
  function add() {
    if (!url.trim()) return;
    onChange([...value, url.trim()]);
    setUrl("");
  }
  return (
    <div className="grid gap-2">
      {value.map((src, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input value={src} readOnly className="text-xs" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <div className="flex gap-2">
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste an image URL" />
        <Button type="button" variant="outline" onClick={add}>
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </div>
    </div>
  );
}