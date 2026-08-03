"use client";

import { useQuery } from "@tanstack/react-query";

export type LinkItem = {
  id: string;
  slug: string;
  destination: string;
  title: string | null;
  description: string | null;
  notes: string | null;
  isArchived: boolean;
  isFavorite: boolean;
  clickCount: number;
  shortUrl: string;
  createdAt: string;
  tags: { id: string; name: string }[];
  folder: { id: string; name: string } | null;
  qrCode: { id: string } | null;
  passwordHash: string | null;
  expiresAt: string | null;
  activateAt: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  iosDeepLink: string | null;
  androidDeepLink: string | null;
};

export type LinkListResponse = {
  items: LinkItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type LinkQuery = {
  search?: string;
  folderId?: string;
  tagId?: string;
  archived?: boolean;
  favorite?: boolean;
  sort?: "createdAt" | "clicks" | "title";
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export function linkQueryKey(query: LinkQuery) {
  return ["links", query] as const;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export function useLinks(query: LinkQuery) {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.folderId) params.set("folderId", query.folderId);
  if (query.tagId) params.set("tagId", query.tagId);
  if (query.archived !== undefined)
    params.set("archived", String(query.archived));
  if (query.favorite) params.set("favorite", "true");
  if (query.sort) params.set("sort", query.sort);
  if (query.order) params.set("order", query.order);
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));

  return useQuery({
    queryKey: linkQueryKey(query),
    queryFn: () => fetchJson<LinkListResponse>(`/api/links?${params.toString()}`),
  });
}

export function useFolders() {
  return useQuery({
    queryKey: ["folders"],
    queryFn: () =>
      fetchJson<
        { id: string; name: string; _count: { links: number } }[]
      >("/api/folders"),
  });
}

export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: () =>
      fetchJson<{ id: string; name: string; _count: { links: number } }[]>(
        "/api/tags",
      ),
  });
}

export { fetchJson };