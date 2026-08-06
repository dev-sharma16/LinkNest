import { ImageResponse } from "next/og";
import { ChainLink } from "@/components/seo/chain-link";
import {
  SITE_NAME,
  SITE_TAGLINE,
  SITE_DESCRIPTION,
} from "@/lib/seo";

export const runtime = "nodejs";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

/**
 * Default Open Graph / Twitter share image for the whole site.
 * Referenced from the root layout as `${SITE_URL}/og`.
 */
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "sans-serif",
          padding: 80,
        }}
      >
        <ChainLink color="#fafafa" pill={34} gap={12} />
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: -3,
            marginTop: 40,
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            fontSize: 40,
            color: "#a1a1aa",
            marginTop: 16,
            textAlign: "center",
          }}
        >
          {SITE_TAGLINE}
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#52525b",
            marginTop: 40,
            maxWidth: 720,
            textAlign: "center",
          }}
        >
          {SITE_DESCRIPTION}
        </div>
      </div>
    ),
    size,
  );
}
