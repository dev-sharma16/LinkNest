"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { fetchJson } from "@/hooks/use-storefronts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UploadButton } from "@/components/bio/upload-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type FormValues = {
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  bannerImage: string;
  visibility: string;
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
};

export function StorefrontFormDialog({
  open,
  onOpenChange,
  storefront,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storefront?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    coverImage: string | null;
    bannerImage: string | null;
    visibility: string;
    seoTitle: string | null;
    seoDescription: string | null;
    ogImage: string | null;
  } | null;
}) {
  const qc = useQueryClient();
  const isEdit = Boolean(storefront);
  const [form, setForm] = useState<FormValues>(() => ({
    name: storefront?.name ?? "",
    slug: storefront?.slug ?? "",
    description: storefront?.description ?? "",
    coverImage: storefront?.coverImage ?? "",
    bannerImage: storefront?.bannerImage ?? "",
    visibility: storefront?.visibility ?? "public",
    seoTitle: storefront?.seoTitle ?? "",
    seoDescription: storefront?.seoDescription ?? "",
    ogImage: storefront?.ogImage ?? "",
  }));
  const [saving, setSaving] = useState(false);

  function set<K extends keyof FormValues>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      if (isEdit && storefront) {
        await fetchJson(`/api/storefronts/${storefront.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        toast.success("Storefront saved");
      } else {
        const created = await fetchJson<{ id: string }>("/api/storefronts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        toast.success("Storefront created");
        onOpenChange(false);
        window.location.href = `/storefronts/${created.id}/edit`;
        return;
      }
      await qc.invalidateQueries({ queryKey: ["storefronts"] });
      await qc.invalidateQueries({ queryKey: ["storefronts", storefront?.id] });
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit storefront" : "New storefront"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update your storefront details."
              : "Set up your storefront. You can customize everything later."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[60vh] gap-4 overflow-y-auto pr-1">
          <Field label="Storefront name">
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="My recommendations"
            />
          </Field>
          <Field label="Public slug">
            <Input
              value={form.slug}
              onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              placeholder="my-store"
            />
            <p className="text-xs text-muted-foreground">
              Your page will be available at /s/{form.slug || "my-store"}
            </p>
          </Field>
          <Field label="Description">
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              placeholder="What is this store about?"
            />
          </Field>
          <div className="grid gap-3">
            <Label>Cover image</Label>
            <div className="flex flex-wrap items-center gap-3">
              {form.coverImage ? (
                <img
                  src={form.coverImage}
                  alt=""
                  className="h-16 w-28 rounded-lg border object-cover"
                  width={112}
                  height={64}
                />
              ) : null}
              <UploadButton value={form.coverImage} onChange={(url) => set("coverImage", url)} folder="storefronts" />
            </div>
          </div>
          <div className="grid gap-3">
            <Label>Banner image</Label>
            <div className="flex flex-wrap items-center gap-3">
              {form.bannerImage ? (
                <img
                  src={form.bannerImage}
                  alt=""
                  className="h-16 w-28 rounded-lg border object-cover"
                  width={112}
                  height={64}
                />
              ) : null}
              <UploadButton value={form.bannerImage} onChange={(url) => set("bannerImage", url)} folder="storefronts" />
            </div>
          </div>
          <Field label="Visibility">
            <Select value={form.visibility} onValueChange={(v) => set("visibility", v ?? "public")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="SEO title">
            <Input value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} />
          </Field>
          <Field label="SEO description">
            <Textarea value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} rows={2} />
          </Field>
          <div className="grid gap-3">
            <Label>Open Graph image</Label>
            <div className="flex flex-wrap items-center gap-3">
              {form.ogImage ? (
                <img
                  src={form.ogImage}
                  alt=""
                  className="h-16 w-28 rounded-lg border object-cover"
                  width={112}
                  height={64}
                />
              ) : null}
              <UploadButton value={form.ogImage} onChange={(url) => set("ogImage", url)} folder="storefronts" />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving || !form.name.trim()}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create storefront"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
