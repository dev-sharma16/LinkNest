"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { fetchJson, useBioSocials } from "@/hooks/use-bio";
import { SOCIAL_PLATFORMS } from "@/lib/validations/bio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { BioSocial } from "@/hooks/use-bio";

export function SocialLinksEditor() {
  const qc = useQueryClient();
  const { data, isLoading } = useBioSocials();
  const [platform, setPlatform] = useState("instagram");
  const [url, setUrl] = useState("");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["bio-socials"] });

  const addMutation = useMutation({
    mutationFn: (body: { platform: string; url: string }) =>
      fetchJson<BioSocial>("/api/bio/socials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      invalidate();
      setUrl("");
      toast.success("Social link added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) =>
      fetchJson<{ ok: true }>(`/api/bio/socials/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  async function persistOrder(items: BioSocial[]) {
    try {
      await fetchJson(
        "/api/bio/socials/replace",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((s) => ({ platform: s.platform, url: s.url })),
          }),
        },
      );
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to reorder");
    }
  }

  function move(index: number, dir: -1 | 1) {
    const list = [...(data ?? [])];
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    const [item] = list.splice(index, 1);
    list.splice(target, 0, item);
    persistOrder(list);
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        <Select value={platform} onValueChange={(v) => setPlatform(v ?? "instagram")}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SOCIAL_PLATFORMS.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://instagram.com/you"
          className="min-w-[200px] flex-1"
        />
        <Button
          onClick={() => {
            if (!url.trim()) return;
            addMutation.mutate({ platform, url });
          }}
          disabled={addMutation.isPending}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>

      <div className="grid gap-2">
        {isLoading ? (
          <Skeleton className="h-12 w-full" />
        ) : (data ?? []).length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No social links yet. Add one to show it on your page.
          </p>
        ) : (
          (data ?? []).map((s, index) => (
            <div
              key={s.id}
              className="flex items-center gap-2 rounded-lg border px-3 py-2"
            >
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  aria-label="Move up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === (data?.length ?? 0) - 1}
                  className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  aria-label="Move down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>
              <span className="w-24 shrink-0 text-sm capitalize">{s.platform}</span>
              <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                {s.url}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => removeMutation.mutate(s.id)}
                aria-label={`Remove ${s.platform}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}