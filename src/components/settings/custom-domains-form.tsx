"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Globe, Loader2 } from "lucide-react";
import { fetchJson } from "@/hooks/use-links";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type Domain = {
  id: string;
  domain: string;
  verified: boolean;
  createdAt: string;
  _count: { links: number };
};

export function CustomDomainsForm() {
  const qc = useQueryClient();
  const [domain, setDomain] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["custom-domains"],
    queryFn: () => fetchJson<Domain[]>("/api/custom-domains"),
  });

  const createMutation = useMutation({
    mutationFn: (name: string) =>
      fetchJson<Domain>("/api/custom-domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: name }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["custom-domains"] });
      setDomain("");
      toast.success("Domain added");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/custom-domains/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["custom-domains"] });
      toast.success("Domain removed");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="grid gap-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (domain.trim()) createMutation.mutate(domain.trim());
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="links.example.com"
            className="pl-9"
          />
        </div>
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Add
        </Button>
      </form>

      <div className="grid gap-2">
        {isLoading ? (
          <Skeleton className="h-12 w-full" />
        ) : (data ?? []).length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No custom domains yet. Add one to brand your short links.
          </p>
        ) : (
          (data ?? []).map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between rounded-lg border px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{d.domain}</p>
                <p className="text-xs text-muted-foreground">
                  {d._count.links} link{d._count.links === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {d.verified ? (
                  <Badge variant="secondary">Verified</Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Add a CNAME pointing to linknest.dev to verify
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => deleteMutation.mutate(d.id)}
                  aria-label={`Remove ${d.domain}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}