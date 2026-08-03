"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchJson } from "@/hooks/use-links";
import type { CreateLinkValues } from "@/lib/validations/links";

function invalidateLinks(client: ReturnType<typeof useQueryClient>) {
  client.invalidateQueries({ queryKey: ["links"] });
  client.invalidateQueries({ queryKey: ["dashboard"] });
}

export function useCreateLink(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: CreateLinkValues) =>
      fetchJson<{ id: string }>("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      }),
    onSuccess: () => {
      invalidateLinks(qc);
      toast.success("Link created");
      onSuccess?.();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateLink(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: CreateLinkValues }) =>
      fetchJson<{ id: string }>(`/api/links/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      }),
    onSuccess: (_, { id }) => {
      invalidateLinks(qc);
      qc.invalidateQueries({ queryKey: ["link", id] });
      toast.success("Link updated");
      onSuccess?.();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteLinks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      fetchJson<{ count: number }>("/api/links/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", ids }),
      }),
    onSuccess: (data) => {
      invalidateLinks(qc);
      toast.success(`Deleted ${data.count} link${data.count === 1 ? "" : "s"}`);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, favorite }: { id: string; favorite: boolean }) =>
      fetchJson<{ favorite: boolean }>(`/api/links/${id}/favorite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorite }),
      }),
    onSuccess: () => {
      invalidateLinks(qc);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useArchiveLinks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      ids,
      archived,
    }: {
      ids: string[];
      archived: boolean;
    }) =>
      fetchJson<{ count: number }>("/api/links/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: archived ? "archive" : "unarchive",
          ids,
        }),
      }),
    onSuccess: () => {
      invalidateLinks(qc);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useCreateFolder(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      fetchJson<{ id: string }>("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["folders"] });
      toast.success("Folder created");
      onSuccess?.();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useCreateTag(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      fetchJson<{ id: string }>("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tags"] });
      toast.success("Tag created");
      onSuccess?.();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}