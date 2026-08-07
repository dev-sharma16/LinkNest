"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Copy,
  Check,
  Download,
  QrCode,
  MessageCircle,
  Link2,
} from "lucide-react";
import { fetchJson, useStorefront } from "@/hooks/use-storefronts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { absoluteUrl, copyText } from "@/components/ui/copy-link-button";

type QrData = { dataUrl: string; target: string; size: number };

function BrandSvg({ path, label }: { path: string; label: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="mr-2 h-4 w-4"
      fill="currentColor"
      aria-label={label}
      role="img"
    >
      <path d={path} />
    </svg>
  );
}

const X_PATH =
  "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z";
const FACEBOOK_PATH =
  "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z";
const LINKEDIN_PATH =
  "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z";

export function SharePanel({ storefrontId }: { storefrontId: string }) {
  const { data: storefront, isLoading } = useStorefront(storefrontId);
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const qrQuery = useQuery({
    queryKey: ["storefront-qr", storefrontId],
    enabled: qrOpen,
    queryFn: () => fetchJson<QrData>(`/api/storefronts/${storefrontId}/qr`),
  });

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!storefront) {
    return (
      <div className="py-10 text-center text-muted-foreground">
        Storefront not found.
      </div>
    );
  }

  const sf = storefront;

  const publicUrl = absoluteUrl(`/s/${storefront.slug}`);
  const published = storefront.published && storefront.visibility === "public";

  async function copyLink() {
    const ok = await copyText(publicUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function downloadQr() {
    if (!qrQuery.data) return;
    const a = document.createElement("a");
    a.href = qrQuery.data.dataUrl;
    a.download = `linknest-store-${sf.slug}-qr.png`;
    a.click();
  }

  const encoded = encodeURIComponent(publicUrl);
  const shareTargets = [
    {
      label: "X / Twitter",
      href: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodeURIComponent(`Check out ${sf.name} on LinkNest`)}`,
      icon: <BrandSvg path={X_PATH} label="X" />,
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      icon: <BrandSvg path={FACEBOOK_PATH} label="Facebook" />,
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
      icon: <BrandSvg path={LINKEDIN_PATH} label="LinkedIn" />,
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${sf.name}: ${publicUrl}`)}`,
      icon: <MessageCircle className="mr-2 h-4 w-4" />,
    },
  ];

  return (
    <div className="grid max-w-2xl gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Share storefront</h1>
        <p className="text-sm text-muted-foreground">
          Share your storefront with the world.
        </p>
      </div>

      {!published && (
        <Card className="border-amber-500/40">
          <CardContent className="py-4 text-sm text-amber-600 dark:text-amber-400">
            Publish your storefront to make it publicly accessible. Draft storefronts
            are only visible to you.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Public link</CardTitle>
          <CardDescription>Share this URL anywhere</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={publicUrl} readOnly className="pl-8" />
            </div>
            <Button variant="outline" onClick={copyLink}>
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button onClick={() => setQrOpen(true)}>
              <QrCode className="mr-2 h-4 w-4" />
              QR code
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social sharing</CardTitle>
          <CardDescription>One-click share to your favorite networks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {shareTargets.map((t) => (
              <Button
                key={t.label}
                variant="outline"
                nativeButton={false}
                render={<a href={t.href} target="_blank" rel="noopener noreferrer" />}
              >
                {t.icon}
                {t.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>QR code</DialogTitle>
            <DialogDescription>
              Scan or download the QR code for /s/{storefront.slug}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            {qrQuery.isLoading ? (
              <div className="h-52 w-52 animate-pulse rounded-lg bg-muted" />
            ) : qrQuery.data ? (
              <img
                src={qrQuery.data.dataUrl}
                alt={`QR code for /s/${storefront.slug}`}
                className="h-52 w-52 rounded-lg border"
                width={208}
                height={208}
              />
            ) : null}
            <Button variant="outline" onClick={downloadQr} disabled={!qrQuery.data} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download PNG
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
