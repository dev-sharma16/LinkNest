"use client";

import { useQuery } from "@tanstack/react-query";

export type SocialAccountItem = {
  id: string;
  platform: string;
  platformUserId: string;
  username: string;
  displayName: string | null;
  accessToken: string;
  refreshToken: string | null;
  tokenExpiresAt: string | null;
  scope: string | null;
  status: string;
  email: string | null;
  avatar: string | null;
  createdAt: string;
};

export type AutomationItem = {
  id: string;
  name: string;
  keywords: string[];
  replyMessage: string;
  url: string;
  cooldownMinutes: number;
  status: "draft" | "active" | "paused" | "error" | "disabled";
  createdAt: string;
  socialAccount: {
    id: string;
    platform: string;
    username: string;
    displayName: string | null;
    status: string;
  };
  _count: { events: number; processedComments: number };
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export function useAutomations() {
  return useQuery({
    queryKey: ["automations"],
    queryFn: () => fetchJson<AutomationItem[]>("/api/automations"),
  });
}

export function useAutomation(id: string) {
  return useQuery({
    queryKey: ["automations", id],
    queryFn: () => fetchJson<AutomationItem>(`/api/automations/${id}`),
  });
}

export function useSocialAccounts() {
  return useQuery({
    queryKey: ["social-accounts"],
    queryFn: () => fetchJson<SocialAccountItem[]>("/api/social-accounts"),
  });
}

export { fetchJson };