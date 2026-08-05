"use client";

import { useQuery } from "@tanstack/react-query";

export type StorefrontProduct = {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  url: string;
  ctaText: string | null;
  featured: boolean;
  order: number;
  createdAt: string;
};

export type StorefrontItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  bannerImage: string | null;
  visibility: string;
  published: boolean;
  archived: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
  appearance: Record<string, unknown> | null;
  createdAt: string;
  products: StorefrontProduct[];
  _count: { products: number; events: number };
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export function useStorefronts() {
  return useQuery({
    queryKey: ["storefronts"],
    queryFn: () => fetchJson<StorefrontItem[]>("/api/storefronts"),
  });
}

export function useStorefront(id: string) {
  return useQuery({
    queryKey: ["storefronts", id],
    queryFn: () => fetchJson<StorefrontItem>(`/api/storefronts/${id}`),
  });
}

export function useProducts(storefrontId: string) {
  return useQuery({
    queryKey: ["storefront-products", storefrontId],
    queryFn: () => fetchJson<StorefrontProduct[]>(`/api/storefronts/${storefrontId}/products`),
  });
}

export { fetchJson };
