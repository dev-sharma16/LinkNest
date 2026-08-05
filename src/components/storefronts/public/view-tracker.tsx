"use client";

import { useEffect, useRef } from "react";

export function StorefrontViewTracker({ slug }: { slug: string }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    fetch(`/api/s/${encodeURIComponent(slug)}/view`, { method: "POST" }).catch(
      () => undefined,
    );
  }, [slug]);
  return null;
}
