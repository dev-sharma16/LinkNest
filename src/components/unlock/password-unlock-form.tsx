"use client";

import { useState } from "react";

export function PasswordUnlockForm({ slug }: { slug: string }) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) {
      setError("Enter the link password");
      return;
    }
    setIsLoading(true);
    setError(null);
    const res = await fetch("/api/unlock/" + encodeURIComponent(slug), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setIsLoading(false);

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? "Incorrect password");
      return;
    }

    window.location.replace(`/${encodeURIComponent(slug)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <div>
        <label
          htmlFor="link-password"
          className="mb-1.5 block text-sm font-medium"
        >
          This link is password protected
        </label>
        <input
          id="link-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          autoFocus
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isLoading ? "Unlocking…" : "Unlock link"}
      </button>
    </form>
  );
}