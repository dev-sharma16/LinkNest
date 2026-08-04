"use client";

export function ClickableLink({
  username,
  blockId,
  href,
  rel,
  target,
  className,
  style,
  onClick,
  children,
}: {
  username: string;
  blockId: string;
  href?: string;
  rel?: string;
  target?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    onClick?.();
    fetch(
      `/api/bio/${encodeURIComponent(username)}/click?block=${encodeURIComponent(blockId)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    ).catch(() => undefined);

    if (target === "_blank") {
      window.open(href, "_blank", "noopener,noreferrer");
    } else if (href) {
      window.location.href = href;
    }
  }

  return (
    <a
      href={href}
      target={target}
      rel={rel ?? "noopener noreferrer"}
      className={className}
      style={style}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}