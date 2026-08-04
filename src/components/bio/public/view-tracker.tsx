"use client";

import { useEffect, useRef } from "react";

export function ViewTracker({ username }: { username: string }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    fetch(`/api/bio/${encodeURIComponent(username)}/view`, { method: "POST" }).catch(
      () => undefined,
    );
  }, [username]);
  return null;
}