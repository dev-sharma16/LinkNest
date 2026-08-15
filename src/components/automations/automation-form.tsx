"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, Sparkles } from "lucide-react";
import {
  fetchJson,
  useSocialAccounts,
  type AutomationItem,
} from "@/hooks/use-automations";
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
  socialAccountId: string;
  keywords: string;
  replyMessage: string;
  url: string;
  cooldownMinutes: number;
};

export function AutomationFormDialog({
  open,
  onOpenChange,
  automation,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  automation?: AutomationItem | null;
}) {
  const qc = useQueryClient();
  const { data: accounts } = useSocialAccounts();
  const isEdit = Boolean(automation);
  const [form, setForm] = useState<FormValues>(() => ({
    name: automation?.name ?? "",
    socialAccountId: automation?.socialAccount.id ?? "",
    keywords: automation?.keywords.join(", ") ?? "",
    replyMessage: automation?.replyMessage ?? "Here you go 👇",
    url: automation?.url ?? "",
    cooldownMinutes: automation?.cooldownMinutes ?? 60,
  }));
  const [saving, setSaving] = useState(false);

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const keywords = form.keywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  const preview = form.url.trim()
    ? `${form.replyMessage.trim()}\n\n${form.url.trim()}`
    : form.replyMessage;

  async function save() {
    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.socialAccountId) return toast.error("Select an account");
    if (keywords.length === 0) return toast.error("Add at least one keyword");
    if (!form.url.trim()) return toast.error("Link is required");

    const payload = {
      name: form.name.trim(),
      socialAccountId: form.socialAccountId,
      keywords,
      replyMessage: form.replyMessage.trim(),
      url: form.url.trim(),
      cooldownMinutes: form.cooldownMinutes,
    };

    setSaving(true);
    try {
      if (isEdit && automation) {
        await fetchJson(`/api/automations/${automation.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Automation saved");
      } else {
        await fetchJson<{ id: string }>("/api/automations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Automation created");
      }
      await qc.invalidateQueries({ queryKey: ["automations"] });
      await qc.invalidateQueries({ queryKey: ["automations", automation?.id] });
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
          <DialogTitle>
            {isEdit ? "Edit automation" : "New comment automation"}
          </DialogTitle>
          <DialogDescription>
            Automatically reply to comments that mention your keyword.
          </DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[60vh] gap-4 overflow-y-auto pr-1">
          <div className="grid gap-1.5">
            <Label>Automation name</Label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Reel Product Link"
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Platform</Label>
            <div className="flex h-10 items-center rounded-lg border bg-muted/40 px-3 text-sm text-muted-foreground">
              Instagram
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label>Account</Label>
            <Select
              value={form.socialAccountId}
              onValueChange={(v) => set("socialAccountId", v ?? "")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an account" />
              </SelectTrigger>
              <SelectContent>
                {(accounts ?? []).map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    @{a.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label>Keywords</Label>
            <Input
              value={form.keywords}
              onChange={(e) => set("keywords", e.target.value)}
              placeholder="link, seen, send"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated. Matching is case-insensitive (e.g. &ldquo;link&rdquo;,
              &ldquo;link please&rdquo;).
            </p>
          </div>

          <div className="grid gap-1.5">
            <Label>Reply message</Label>
            <Textarea
              value={form.replyMessage}
              onChange={(e) => set("replyMessage", e.target.value)}
              rows={3}
              placeholder="Here you go 👇"
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Link</Label>
            <Input
              value={form.url}
              onChange={(e) => set("url", e.target.value)}
              placeholder="https://www.myntra.com/example"
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Cooldown (minutes)</Label>
            <Input
              type="number"
              min={1}
              max={10080}
              value={form.cooldownMinutes}
              onChange={(e) =>
                set("cooldownMinutes", Number(e.target.value) || 60)
              }
            />
            <p className="text-xs text-muted-foreground">
              Don&apos;t reply to the same person on the same post more than once
              in this window.
            </p>
          </div>

          <div className="grid gap-2 rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              Reply preview
            </div>
            <p className="whitespace-pre-wrap text-sm">{preview || "…"}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create automation"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}