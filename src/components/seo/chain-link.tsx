/**
 * A simple chain-link glyph drawn with two rotated pills.
 * Used inside `ImageResponse` generated images (OG image, icons).
 */
export function ChainLink({
  color,
  pill,
  gap,
}: {
  color: string;
  pill: number;
  gap: number;
}) {
  const height = Math.round(pill * 3.2);
  const border = Math.round(pill * 0.32);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: pill,
          height,
          borderRadius: pill,
          border: `${border}px solid ${color}`,
          transform: "rotate(45deg)",
          marginRight: -gap,
        }}
      />
      <div
        style={{
          width: pill,
          height,
          borderRadius: pill,
          border: `${border}px solid ${color}`,
          transform: "rotate(-45deg)",
          marginLeft: -gap,
        }}
      />
    </div>
  );
}
