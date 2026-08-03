"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { fetchJson } from "@/hooks/use-links";

type QrData = {
  id: string;
  dataUrl: string;
  fgColor: string;
  bgColor: string;
  size: number;
};

export function QrDialog({
  linkId,
  slug,
  open,
  onOpenChange,
}: {
  linkId: string;
  slug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["qr", linkId],
    enabled: open,
    queryFn: () =>
      fetchJson<QrData>(
        `/api/qr/${linkId}`,
      ),
  });

  function download() {
    if (!data) return;
    const a = document.createElement("a");
    a.href = data.dataUrl;
    a.download = `linknest-${slug}-qr.png`;
    a.click();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>QR code</DialogTitle>
          <DialogDescription>
            Scan or download the QR code for /{slug}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          {isLoading ? (
            <div className="h-52 w-52 animate-pulse rounded-lg bg-muted" />
          ) : data ? (
            <img
              src={data.dataUrl}
              alt={`QR code for /${slug}`}
              className="h-52 w-52 rounded-lg border"
              width={208}
              height={208}
            />
          ) : null}
          <Button
            variant="outline"
            onClick={download}
            disabled={!data}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            Download PNG
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}