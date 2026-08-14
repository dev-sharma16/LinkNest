"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, ExternalLink, Loader2 } from "lucide-react";
import { fetchJson, useBioProfile, type BioProfile } from "@/hooks/use-bio";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { BlockEditor } from "@/components/bio/block-editor";
import { SocialLinksEditor } from "@/components/bio/social-links-editor";
import { ThemeEditor } from "@/components/bio/theme-editor";
import { UploadButton } from "@/components/bio/upload-button";
import { CopyLinkButton } from "@/components/ui/copy-link-button";
import { toast } from "sonner";

export function BioEditor() {
  const qc = useQueryClient();
  const { data: profile, isLoading } = useBioProfile();

  const publishMutation = useMutation({
    mutationFn: (published: boolean) =>
      fetchJson("/api/bio/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bio-profile"] });
      toast.success("Published changes");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!profile) {
    return <div className="py-10 text-center text-muted-foreground">Loading your bio…</div>;
  }

  const publicUrl = profile.published ? `/u/${profile.username}` : null;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Link in Bio</h1>
          <p className="text-sm text-muted-foreground">
            Build a public page at{" "}
            <span className="text-primary">/u/{profile.username}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={profile.published}
              onCheckedChange={(v) => publishMutation.mutate(v)}
            />
            {profile.published ? "Published" : "Draft"}
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
        </div>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="flex-wrap">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="blocks">Blocks</TabsTrigger>
          <TabsTrigger value="socials">Social links</TabsTrigger>
          <TabsTrigger value="appearance">Theme</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="pt-4">
          <ProfileTab profile={profile} />
        </TabsContent>

        <TabsContent value="blocks" className="pt-4">
          <BlockEditor />
        </TabsContent>

        <TabsContent value="socials" className="pt-4">
          <SocialLinksEditor />
        </TabsContent>

        <TabsContent value="appearance" className="pt-4">
          <ThemeEditor initial={profile.appearance} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

type ProfileForm = {
  username: string;
  displayName: string;
  bio: string;
  location: string;
  website: string;
  avatar: string;
  visibility: string;
  seoTitle: string;
  seoDescription: string;
};

function ProfileTab({ profile }: { profile: BioProfile }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<ProfileForm>(() => ({
    username: profile.username,
    displayName: profile.displayName,
    bio: profile.bio ?? "",
    location: profile.location ?? "",
    website: profile.website ?? "",
    avatar: profile.avatar ?? "",
    visibility: profile.visibility,
    seoTitle: profile.seoTitle ?? "",
    seoDescription: profile.seoDescription ?? "",
  }));
  const [saving, setSaving] = useState(false);

  async function saveProfile() {
    setSaving(true);
    try {
      await fetchJson("/api/bio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      await qc.invalidateQueries({ queryKey: ["bio-profile"] });
      toast.success("Profile saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function set(key: keyof ProfileForm, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="grid max-w-2xl gap-4">
      <div className="grid gap-2">
        <Label>Profile picture</Label>
        <div className="flex flex-wrap items-center gap-3">
          {form.avatar ? (
            <img src={form.avatar} alt="" className="h-14 w-14 rounded-full border object-cover" width={56} height={56} />
          ) : null}
          <UploadButton value={form.avatar} onChange={(url) => set("avatar", url)} folder="avatars" />
        </div>
      </div>
      <FormField label="Username">
        <Input value={form.username} onChange={(e) => set("username", e.target.value)} />
      </FormField>
      <FormField label="Display name">
        <Input value={form.displayName} onChange={(e) => set("displayName", e.target.value)} />
      </FormField>
      <FormField label="Bio">
        <Textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={3} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Location">
          <Input value={form.location} onChange={(e) => set("location", e.target.value)} />
        </FormField>
        <FormField label="Website">
          <Input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" />
        </FormField>
      </div>
      <FormField label="SEO title">
        <Input value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} />
      </FormField>
      <FormField label="SEO description">
        <Textarea value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} rows={2} />
      </FormField>
      <div>
        <Button onClick={saveProfile} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {saving ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}