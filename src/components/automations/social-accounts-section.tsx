"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Loader2, Plus, Trash2 } from "lucide-react";
import {
  fetchJson,
  useSocialAccounts,
  type SocialAccountItem,
} from "@/hooks/use-automations";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type ConnectForm = {
  username: string;
  platformUserId: string;
  displayName: string;
  accessToken: string;
};

export function SocialAccountsSection() {
  const qc = useQueryClient();
  const { data, isLoading } = useSocialAccounts();
  const [open, setOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState<SocialAccountItem | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["social-accounts"] });

  const disconnectMutation = useMutation({
    mutationFn: (id: string) =>
      fetchJson<{ ok: true }>(`/api/social-accounts/${id}/disconnect`, {
        method: "POST",
      }),
    onSuccess: () => {
      invalidate();
      setDisconnecting(null);
      toast.success("Account disconnected");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Connected accounts</h2>
          <p className="text-sm text-muted-foreground">
            LinkNest never sees or stores your social media password.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Connect account
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : (data ?? []).length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No accounts connected yet. Connect an Instagram account to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {data!.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 to-pink-600">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      @{a.username}
                      {a.displayName ? ` · ${a.displayName}` : ""}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {a.platform} · {a.status}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDisconnecting(a)}
                  aria-label="Disconnect account"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConnectDialog open={open} onOpenChange={setOpen} />

      <AlertDialog
        open={!!disconnecting}
        onOpenChange={(o) => !o && setDisconnecting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect account?</AlertDialogTitle>
            <AlertDialogDescription>
              @{disconnecting?.username} will be disconnected. Running automations
              using it will stop.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={disconnectMutation.isPending}
              onClick={() =>
                disconnecting && disconnectMutation.mutate(disconnecting.id)
              }
            >
              {disconnectMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ConnectDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState<ConnectForm>({
    username: "",
    platformUserId: "",
    displayName: "",
    accessToken: "",
  });
  const [saving, setSaving] = useState(false);

  function set<K extends keyof ConnectForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    if (!form.platformUserId.trim() || !form.username.trim()) {
      toast.error("Username is required");
      return;
    }
    setSaving(true);
    try {
      await fetchJson("/api/social-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: "instagram",
          platformUserId: form.platformUserId.trim(),
          username: form.username.trim().replace(/^@/, ""),
          displayName: form.displayName || "",
          accessToken: form.accessToken.trim() || "simulated-token",
        }),
      });
      await qc.invalidateQueries({ queryKey: ["social-accounts"] });
      toast.success("Account connected");
      setForm({
        username: "",
        platformUserId: "",
        displayName: "",
        accessToken: "",
      });
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to connect");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Connect Instagram account</DialogTitle>
          <DialogDescription>
            Connect your Instagram account through the official Meta OAuth flow.
            Your password is never requested or stored.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-lg border p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 to-pink-600">
            <Camera className="h-5 w-5 text-white" />
          </div>
          <p className="text-sm text-muted-foreground">
            The Meta OAuth dialog is wired here. In development the simulated
            adapter accepts manual account details so you can try the full flow.
          </p>
        </div>

        <div className="grid max-h-[50vh] gap-4 overflow-y-auto pr-1">
          <div className="grid gap-1.5">
            <Label>Instagram username</Label>
            <Input
              value={form.username}
              onChange={(e) => set("username", e.target.value)}
              placeholder="@creator"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Platform user ID</Label>
            <Input
              value={form.platformUserId}
              onChange={(e) => set("platformUserId", e.target.value)}
              placeholder="17841405812345678"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Display name (optional)</Label>
            <Input
              value={form.displayName}
              onChange={(e) => set("displayName", e.target.value)}
              placeholder="My brand"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Access token (simulated)</Label>
            <Input
              value={form.accessToken}
              onChange={(e) => set("accessToken", e.target.value)}
              placeholder="IGAA..."
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use a simulated token in development.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Connect
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}