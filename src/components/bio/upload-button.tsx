"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function UploadButton({
  value,
  onChange,
  folder = "linknest",
}: {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const sigRes = await fetch(`/api/uploads/imagekit?folder=${encodeURIComponent(folder)}`);
      const sig = (await sigRes.json()) as {
        configured: boolean;
        token?: string;
        signature?: string;
        expire?: number;
        publicKey?: string;
        urlEndpoint?: string;
      };
      if (!sig.configured || !sig.token) {
        toast.error("ImageKit is not configured. Paste an image URL instead.");
        return;
      }
      const form = new FormData();
      form.append("file", file);
      form.append("fileName", file.name.replace(/[^a-zA-Z0-9._-]/g, "-"));
      form.append("useUniqueFileName", "true");
      form.append("folder", folder);
      form.append("publicKey", sig.publicKey!);
      form.append("token", sig.token);
      form.append("expire", String(sig.expire));
      form.append("signature", sig.signature!);

      const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body.slice(0, 200));
      }
      const data = (await res.json()) as { url?: string };
      if (data.url) onChange(data.url);
      toast.success("Uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        {uploading ? "Uploading…" : "Upload image"}
      </Button>
      {value ? (
        <div className="flex items-center gap-2">
          <img src={value} alt="" className="h-9 w-9 rounded border object-cover" width={36} height={36} />
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
        </div>
      ) : null}
    </div>
  );
}