import { ImageResponse } from "next/og";
import { ChainLink } from "@/components/seo/chain-link";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        borderRadius: 40,
      }}
    >
      <ChainLink color="#fafafa" pill={26} gap={9} />
    </div>,
    size,
  );
}
