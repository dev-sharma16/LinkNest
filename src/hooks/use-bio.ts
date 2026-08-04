"use client";

import { useQuery } from "@tanstack/react-query";
import type { BlockType } from "@/lib/validations/bio";

export type BioProfile = {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  verified: boolean;
  visibility: string;
  published: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
  appearance: Record<string, unknown> | null;
  createdAt: string;
  socials: BioSocial[];
  blocks: BioBlock[];
  _count: { events: number; leads: number };
};

export type BioSocial = {
  id: string;
  platform: string;
  url: string;
  order: number;
};

export type BioBlock = {
  id: string;
  type: BlockType;
  order: number;
  config: Record<string, unknown> | null;
  hidden: boolean;
  scheduleStartAt: string | null;
  scheduleEndAt: string | null;
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export function useBioProfile() {
  return useQuery({
    queryKey: ["bio-profile"],
    queryFn: () => fetchJson<BioProfile>("/api/bio"),
  });
}

export function useBioBlocks() {
  return useQuery({
    queryKey: ["bio-blocks"],
    queryFn: () => fetchJson<BioBlock[]>("/api/bio/blocks"),
  });
}

export function useBioSocials() {
  return useQuery({
    queryKey: ["bio-socials"],
    queryFn: () => fetchJson<BioSocial[]>("/api/bio/socials"),
  });
}

export { fetchJson };