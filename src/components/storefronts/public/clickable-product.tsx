"use client";

export function ClickableProduct({
  slug,
  productId,
  href,
  className,
  style,
  children,
}: {
  slug: string;
  productId: string;
  href: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    fetch(
      `/api/s/${encodeURIComponent(slug)}/click?product=${encodeURIComponent(productId)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    )
      .catch(() => undefined)
      .finally(() => {
        window.open(href, "_blank", "noopener,noreferrer");
      });
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={style}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
