"use client";

import { useState } from "react";
import { toast } from "sonner";

export function NewsletterFormBlock({
  username,
  title,
  success,
}: {
  username: string;
  title: string;
  success: string;
}) {
  const [state, setState] = useState<"idle" | "loading" | "sent">("idle");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      await fetch(`/api/bio/${encodeURIComponent(username)}/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });
      setState("sent");
    } catch {
      toast.error("Something went wrong");
      setState("idle");
    }
  }

  if (state === "sent") {
    return <p className="text-center text-sm">{success}</p>;
  }

  return (
    <form onSubmit={submit} className="grid gap-2">
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        className="hidden"
        aria-hidden="true"
      />
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2"
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {state === "loading" ? "Subscribing…" : "Subscribe"}
      </button>
    </form>
  );
}