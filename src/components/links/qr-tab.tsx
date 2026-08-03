"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { fetchJson } from "@/hooks/use-links";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type QrData = {
  id: string;
  dataUrl: string;
  fgColor: string;
  bgColor: string;
  size: number;
};

export function QrTab({ linkId, slug }: { linkId: string; slug: string }) {
  const qc = useQueryClient();
  const [draftFg, setDraftFg] = useState<string>();
  const [draftBg, setDraftBg] = useState<string>();
  const [draftSize, setDraftSize] = useState<number>();
  const [isSaving, setIsSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["qr", linkId],
    queryFn: () => fetchJson<QrData>(`/api/qr/${linkId}`),
  });

  const fgColor = draftFg ?? data?.fgColor ?? "#000000";
  const bgColor = draftBg ?? data?.bgColor ?? "#ffffff";
  const size = draftSize ?? data?.size ?? 512;

  async function saveConfig() {
    setIsSaving(true);
    try {
      await fetchJson(`/api/links/${linkId}/qr`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fgColor, bgColor, size }),
      });
      setDraftFg(undefined);
      setDraftBg(undefined);
      setDraftSize(undefined);
      await qc.invalidateQueries({ queryKey: ["qr", linkId] });
      toast.success("QR code updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    } finally {
      setIsSaving(false);
    }
  }

  function download() {
    if (!data) return;
    const a = document.createElement("a");
    a.href = data.dataUrl;
    a.download = `linknest-${slug}-qr.png`;
    a.click();
  }

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-6">
          {data ? (
            <img
              src={data.dataUrl}
              alt={`QR code for /${slug}`}
              className="h-56 w-56 rounded-lg border"
              width={224}
              height={224}
            />
          ) : null}
          <Button variant="outline" onClick={download} disabled={!data} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Download PNG
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-5 p-6">
          <div className="grid gap-2">
            <Label htmlFor="fg">Foreground color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="fg"
                value={fgColor}
                onChange={(e) => setDraftFg(e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border"
              />
              <Input value={fgColor} onChange={(e) => setDraftFg(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bg">Background color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="bg"
                value={bgColor}
                onChange={(e) => setDraftBg(e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border"
              />
              <Input value={bgColor} onChange={(e) => setDraftBg(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="size">Size</Label>
            <Input
              id="size"
              type="number"
              min={128}
              max={2048}
              value={size}
              onChange={(e) => setDraftSize(Number(e.target.value) || 512)}
            />
          </div>
          <Button onClick={saveConfig} disabled={isSaving || !data}>
            {isSaving ? "Saving…" : "Apply changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}