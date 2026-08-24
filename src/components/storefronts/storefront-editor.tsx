"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Loader2, Sparkles } from "lucide-react";
import { fetchJson, useStorefront } from "@/hooks/use-storefronts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { StorefrontFormDialog } from "@/components/storefronts/storefront-form";
import { ProductEditor } from "@/components/storefronts/product-editor";
import { StorefrontAppearanceEditor } from "@/components/storefronts/storefront-appearance-editor";
import { CopyLinkButton } from "@/components/ui/copy-link-button";
import { AIBuilderDialog } from "@/components/ai-builder";
import { toast } from "sonner";

export function StorefrontEditor({ storefrontId }: { storefrontId: string }) {
  const qc = useQueryClient();
  const { data: storefront, isLoading } = useStorefront(storefrontId);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const publishMutation = useMutation({
    mutationFn: (published: boolean) =>
      fetchJson(`/api/storefronts/${storefrontId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["storefronts", storefrontId] });
      qc.invalidateQueries({ queryKey: ["storefronts"] });
      toast.success("Published changes");
    },
    onError: (e: Error) => toast.error(e.message),
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

  const publicUrl = storefront.published && storefront.visibility === "public"
    ? `/s/${storefront.slug}`
    : null;

  function handleAISuccess() {
    qc.invalidateQueries({ queryKey: ["storefronts", storefrontId] });
    toast.success("AI design applied to your storefront");
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{storefront.name}</h1>
          <p className="text-sm text-muted-foreground">
            Public at{" "}
            <span className="text-primary">/s/{storefront.slug}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setAiOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" />
            Create with AI
          </Button>
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={storefront.published}
              onCheckedChange={(v) => publishMutation.mutate(v)}
            />
            {storefront.published ? "Published" : "Draft"}
          </label>
          {publicUrl && (
            <>
              <Button variant="outline" nativeButton={false} render={<Link href={publicUrl} target="_blank" />}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View page
              </Button>
              <CopyLinkButton path={publicUrl} />
            </>
          )}
          {publishMutation.isPending && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      <Tabs defaultValue="products">
        <TabsList className="flex-wrap">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="pt-4">
          <ProductEditor storefrontId={storefrontId} />
        </TabsContent>

        <TabsContent value="details" className="pt-4">
          <DetailsTab storefront={storefront} onEdit={() => setDetailsOpen(true)} />
        </TabsContent>

        <TabsContent value="appearance" className="pt-4">
          <StorefrontAppearanceEditor storefrontId={storefrontId} initial={storefront.appearance} />
        </TabsContent>
      </Tabs>

      <StorefrontFormDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        storefront={{
          id: storefront.id,
          name: storefront.name,
          slug: storefront.slug,
          description: storefront.description,
          coverImage: storefront.coverImage,
          bannerImage: storefront.bannerImage,
          visibility: storefront.visibility,
          seoTitle: storefront.seoTitle,
          seoDescription: storefront.seoDescription,
          ogImage: storefront.ogImage,
        }}
      />

      <AIBuilderDialog
        open={aiOpen}
        onOpenChange={setAiOpen}
        targetType="storefront"
        onSuccess={handleAISuccess}
      />
    </div>
  );
}

function DetailsTab({
  storefront,
  onEdit,
}: {
  storefront: {
    name: string;
    slug: string;
    description: string | null;
    coverImage: string | null;
    bannerImage: string | null;
    visibility: string;
    seoTitle: string | null;
    seoDescription: string | null;
    ogImage: string | null;
  };
  onEdit: () => void;
}) {
  const rows: { label: string; value: string }[] = [
    { label: "Name", value: storefront.name },
    { label: "Slug", value: `/s/${storefront.slug}` },
    { label: "Visibility", value: storefront.visibility },
    { label: "SEO title", value: storefront.seoTitle ?? "—" },
    { label: "SEO description", value: storefront.seoDescription ?? "—" },
    { label: "Description", value: storefront.description ?? "—" },
  ];

  return (
    <div className="grid max-w-2xl gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Storefront details</p>
        <Button variant="outline" onClick={onEdit}>
          Edit details
        </Button>
      </div>
      <div className="grid gap-3 rounded-lg border p-4">
        {(storefront.coverImage || storefront.bannerImage || storefront.ogImage) && (
          <div className="flex flex-wrap gap-3">
            {storefront.coverImage && (
              <img src={storefront.coverImage} alt="Cover" className="h-20 w-32 rounded-lg border object-cover" width={128} height={80} />
            )}
            {storefront.bannerImage && (
              <img src={storefront.bannerImage} alt="Banner" className="h-20 w-32 rounded-lg border object-cover" width={128} height={80} />
            )}
            {storefront.ogImage && (
              <img src={storefront.ogImage} alt="OG" className="h-20 w-32 rounded-lg border object-cover" width={128} height={80} />
            )}
          </div>
        )}
        {rows.map((row) => (
          <div key={row.label} className="grid gap-0.5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{row.label}</p>
            <p className="text-sm">{row.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
