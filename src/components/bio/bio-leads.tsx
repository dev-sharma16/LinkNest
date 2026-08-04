"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { fetchJson } from "@/hooks/use-bio";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

type Lead = {
  id: string;
  type: string;
  name: string | null;
  email: string;
  message: string | null;
  createdAt: string;
};

export function BioLeads() {
  const [type, setType] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["bio-leads", type],
    queryFn: () =>
      fetchJson<Lead[]>(
        `/api/bio/leads${type !== "all" ? `?type=${type}` : ""}`,
      ),
  });

  const leads = data ?? [];

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-sm text-muted-foreground">
            Contact form messages and newsletter subscribers.
          </p>
        </div>
        <Button variant="outline" onClick={() => window.open("/api/bio/leads/export", "_blank")}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Tabs value={type} onValueChange={setType}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : leads.length === 0 ? (
        <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
          No leads yet. Add a contact form or newsletter block to collect them.
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden md:table-cell">Message</TableHead>
                <TableHead className="w-32">Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <Badge variant={lead.type === "contact" ? "secondary" : "outline"}>
                      {lead.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{lead.name ?? "—"}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell className="hidden max-w-[260px] truncate text-muted-foreground md:table-cell">
                    {lead.message ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(lead.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}