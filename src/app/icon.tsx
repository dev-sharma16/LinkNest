import { ImageResponse } from "next/og";
import { ChainLink } from "@/components/seo/chain-link";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        borderRadius: 7,
      }}
    >
      <ChainLink color="#fafafa" pill={5} gap={2} />
    </div>,
    size,
  );
}
