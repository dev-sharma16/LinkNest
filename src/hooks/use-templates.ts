"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type SavedTemplate = {
  id: string;
  name: string;
  type: "bio" | "storefront";
  appearance: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export function useSavedTemplates(type: "bio" | "storefront") {
  const qc = useQueryClient();
  const key = ["saved-templates", type] as const;

  const list = useQuery({
    queryKey: key,
    queryFn: () => fetchJson<SavedTemplate[]>(`/api/templates?type=${type}`),
  });

  const create = useMutation({
    mutationFn: (input: { name: string; appearance: Record<string, unknown> }) =>
      fetchJson<SavedTemplate>("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, type }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const update = useMutation({
    mutationFn: (input: {
      id: string;
      name?: string;
      appearance?: Record<string, unknown>;
    }) =>
      fetchJson<SavedTemplate>(`/api/templates/${input.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: input.name,
          appearance: input.appearance,
        }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      fetchJson<{ ok: true }>(`/api/templates/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { list, create, update, remove };
}
