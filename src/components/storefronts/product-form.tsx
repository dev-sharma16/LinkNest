"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { fetchJson, type StorefrontProduct } from "@/hooks/use-storefronts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UploadButton } from "@/components/bio/upload-button";
import { toast } from "sonner";

type FormValues = {
  title: string;
  description: string;
  image: string;
  url: string;
  ctaText: string;
  featured: boolean;
};

const empty: FormValues = {
  title: "",
  description: "",
  image: "",
  url: "",
  ctaText: "",
  featured: false,
};

export function ProductFormDialog({
  open,
  onOpenChange,
  storefrontId,
  product,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storefrontId: string;
  product?: StorefrontProduct;
}) {
  const qc = useQueryClient();
  const isEdit = Boolean(product);
  const [form, setForm] = useState<FormValues>(() =>
    product
      ? {
          title: product.title,
          description: product.description ?? "",
          image: product.image ?? "",
          url: product.url,
          ctaText: product.ctaText ?? "",
          featured: product.featured,
        }
      : empty,
  );
  const [saving, setSaving] = useState(false);

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      if (isEdit && product) {
        await fetchJson(`/api/storefronts/${storefrontId}/products/${product.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        toast.success("Product saved");
      } else {
        await fetchJson(`/api/storefronts/${storefrontId}/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        toast.success("Product added");
      }
      await qc.invalidateQueries({ queryKey: ["storefront-products", storefrontId] });
      await qc.invalidateQueries({ queryKey: ["storefronts", storefrontId] });
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit product" : "Add product"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this product recommendation."
              : "Recommend a product that links to its page on the original website."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[60vh] gap-4 overflow-y-auto pr-1">
          <Field label="Product title">
            <Input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Bose QuietComfort Headphones"
            />
          </Field>
          <div className="grid gap-3">
            <Label>Product image</Label>
            <div className="flex flex-wrap items-center gap-3">
              {form.image ? (
                <img
                  src={form.image}
                  alt=""
                  className="h-16 w-16 rounded-lg border object-cover"
                  width={64}
                  height={64}
                />
              ) : null}
              <UploadButton value={form.image} onChange={(url) => set("image", url)} folder="products" />
            </div>
          </div>
          <Field label="Short description">
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              placeholder="Why do you recommend this product?"
            />
          </Field>
          <Field label="External product URL">
            <Input
              value={form.url}
              onChange={(e) => set("url", e.target.value)}
              placeholder="https://amazon.com/product/…"
            />
          </Field>
          <Field label="CTA button text">
            <Input
              value={form.ctaText}
              onChange={(e) => set("ctaText", e.target.value)}
              placeholder="Buy on Amazon"
            />
            <p className="text-xs text-muted-foreground">
              Visitors are always redirected to the original website.
            </p>
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={form.featured} onCheckedChange={(v) => set("featured", v)} />
            Featured product
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving || !form.title.trim() || !form.url.trim()}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add product"}
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
