"use client";

import { useState } from "react";
import { toast } from "sonner";

export function ContactFormBlock({
  username,
  title,
  success,
  themeName,
  primary,
  text,
}: {
  username: string;
  title: string;
  success: string;
  themeName: string;
  primary: string;
  text: string;
}) {
  const [state, setState] = useState<"idle" | "loading" | "sent">("idle");
  const [values, setValues] = useState({
    name: "",
    email: "",
    message: "",
    token: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      await fetch(`/api/bio/${encodeURIComponent(username)}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      setState("sent");
    } catch {
      toast.error("Something went wrong");
      setState("idle");
    }
  }

  if (state === "sent") {
    return (
      <p className="text-center" style={{ color: text }}>
        {success}
      </p>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2";

  return (
    <form onSubmit={submit} className="grid gap-2">
      {/* honeypot */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={values.token}
        onChange={(e) => setValues({ ...values, token: e.target.value })}
        className="hidden"
        aria-hidden="true"
      />
      <input
        className={inputClass}
        placeholder="Your name"
        value={values.name}
        onChange={(e) => setValues({ ...values, name: e.target.value })}
        required
        minLength={1}
      />
      <input
        type="email"
        className={inputClass}
        placeholder="Your email"
        value={values.email}
        onChange={(e) => setValues({ ...values, email: e.target.value })}
        required
      />
      <textarea
        className={`${inputClass} resize-none`}
        placeholder="Your message"
        value={values.message}
        onChange={(e) => setValues({ ...values, message: e.target.value })}
        required
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="rounded-lg px-4 py-2 text-sm font-semibold transition-opacity disabled:opacity-60"
        style={{
          background: themeName === "dark" ? primary : primary,
          color: "#ffffff",
        }}
      >
        {state === "loading" ? "Sending…" : "Send"}
      </button>
    </form>
  );
}