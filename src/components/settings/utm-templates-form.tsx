"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { fetchJson } from "@/hooks/use-links";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type Template = {
  id: string;
  name: string;
  source: string | null;
  medium: string | null;
  campaign: string | null;
  term: string | null;
  content: string | null;
};

const empty = {
  name: "",
  source: "",
  medium: "",
  campaign: "",
  term: "",
  content: "",
};

export function UtmTemplatesForm() {
  const qc = useQueryClient();
  const [form, setForm] = useState(empty);

  const { data, isLoading } = useQuery({
    queryKey: ["utm-templates"],
    queryFn: () => fetchJson<Template[]>("/api/utm-templates"),
  });

  const createMutation = useMutation({
    mutationFn: (values: typeof form) =>
      fetchJson<Template>("/api/utm-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["utm-templates"] });
      setForm(empty);
      toast.success("Template saved");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/utm-templates/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["utm-templates"] });
      toast.success("Template deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const fields = [
    { key: "source", label: "Source" },
    { key: "medium", label: "Medium" },
    { key: "campaign", label: "Campaign" },
    { key: "term", label: "Term" },
    { key: "content", label: "Content" },
  ] as const;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (form.name.trim()) createMutation.mutate(form);
        }}
        className="grid h-fit gap-4 rounded-lg border p-4"
      >
        <Label>Name</Label>
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Summer campaign"
        />
        <div className="grid gap-2 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.key} className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">{f.label}</Label>
              <Input
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                placeholder={f.key}
              />
            </div>
          ))}
        </div>
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Save template
        </Button>
      </form>

      <div className="grid gap-2">
        {isLoading ? (
          <Skeleton className="h-12 w-full" />
        ) : (data ?? []).length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No templates yet.
          </p>
        ) : (
          (data ?? []).map((t) => (
            <div
              key={t.id}
              className="flex items-start justify-between rounded-lg border px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">{t.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {[t.source, t.medium, t.campaign].filter(Boolean).join(" · ")}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => deleteMutation.mutate(t.id)}
                aria-label={`Delete ${t.name}`}
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