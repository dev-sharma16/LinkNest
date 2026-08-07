"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/** Copies `text` to the clipboard with toast feedback. Resolves true on success. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Link copied");
    return true;
  } catch {
    toast.error("Could not copy link");
    return false;
  }
}

/** Turns a page path (e.g. `/s/my-store`) into an absolute shareable URL. */
export function absoluteUrl(path: string): string {
  return `${typeof window !== "undefined" ? window.location.origin : ""}${path}`;
}

/**
 * A button that copies the absolute URL for a page path, showing a brief
 * "Copied" state. The URL is resolved at click time, so it is safe to render
 * during SSR.
 */
export function CopyLinkButton({
  path,
  label = "Copy link",
  className,
}: {
  path: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const ok = await copyText(absoluteUrl(path));
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <Button variant="outline" onClick={() => void handleCopy()} className={className}>
      {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
      {copied ? "Copied" : label}
    </Button>
  );
}
