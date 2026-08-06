import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private dashboard areas and token-gated pages.
      disallow: [
        "/api/",
        "/dashboard",
        "/analytics",
        "/bio",
        "/links",
        "/settings",
        "/storefronts",
        "/unlock",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
