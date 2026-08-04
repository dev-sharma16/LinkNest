import { getEmbedSrc, toTheme } from "@/lib/bio-css";
import type { CSSProperties } from "react";
import type { BioBlock } from "@/hooks/use-bio";
import { ClickableLink } from "@/components/bio/public/clickable-link";
import { ContactFormBlock } from "@/components/bio/public/contact-form-block";
import { NewsletterFormBlock } from "@/components/bio/public/newsletter-form-block";

export function BlockRenderer({
  blocks,
  username,
  theme,
}: {
  blocks: BioBlock[];
  username: string;
  theme: Record<string, unknown> | null;
}) {
  const t = toTheme(theme);
  return (
    <div
      className="mx-auto w-full max-w-md"
      style={{ gap: t.blockSpacing, display: "grid" }}
    >
      {blocks
        .filter(isVisible)
        .map((block) => (
          <BlockView key={block.id} block={block} username={username} theme={theme} />
        ))}
    </div>
  );
}

function isVisible(block: BioBlock): boolean {
  if (block.hidden) return false;
  const now = Date.now();
  if (block.scheduleStartAt && now < new Date(block.scheduleStartAt).getTime())
    return false;
  if (block.scheduleEndAt && now > new Date(block.scheduleEndAt).getTime())
    return false;
  return true;
}

function BlockView({
  block,
  username,
  theme,
}: {
  block: BioBlock;
  username: string;
  theme: Record<string, unknown> | null;
}) {
  const config = (block.config ?? {}) as Record<string, unknown>;
  const label = String(config.label ?? config.title ?? "");
  const url = String(config.url ?? "");

  switch (block.type) {
    case "link":
      return (
        <ClickableLink
          username={username}
          blockId={block.id}
          href={url}
          className="text-center text-base underline underline-offset-4"
        >
          {label || url}
        </ClickableLink>
      );

    case "button":
      return (
        <ClickableLink
          username={username}
          blockId={block.id}
          href={url}
          className="inline-block w-full rounded-2xl px-4 py-3 text-center text-base font-semibold transition-opacity hover:opacity-90"
          style={{
            background: "var(--bio-btn-bg)",
            color: "var(--bio-btn-text)",
            borderRadius: "var(--bio-btn-radius)",
          }}
        >
          {label}
        </ClickableLink>
      );

    case "text":
      return (
        <p style={{ textAlign: "var(--bio-align)" } as unknown as CSSProperties} className="text-base leading-relaxed">
          {String(config.content ?? "")}
        </p>
      );

    case "heading": {
      const content = String(config.content ?? "");
      const level = (config.level ?? "h2") as "h1" | "h2" | "h3" | "h4";
      const Tag = level;
      return (
        <Tag style={{ textAlign: "var(--bio-align)" } as unknown as CSSProperties} className="font-bold">
          {content}
        </Tag>
      );
    }

    case "divider":
      return (
        <hr
          className="my-2 border-0"
          style={{ borderTopWidth: 1, borderColor: (config.color || "rgba(0,0,0,0.15)") as CSSProperties["borderColor"] }}
        />
      );

    case "spacer":
      return <div style={{ height: Number(config.height ?? 16) }} />;

    case "image":
      return (
        <figure>
          <img
            src={String(config.src ?? "")}
            alt={String(config.alt ?? "")}
            className="w-full rounded-xl object-cover"
          />
          {config.caption ? (
            <figcaption className="mt-1 text-center text-sm opacity-80">
              {String(config.caption)}
            </figcaption>
          ) : null}
        </figure>
      );

    case "gallery":
      return (
        <div className="grid grid-cols-2 gap-2">
          {((config.images as string[]) ?? []).map((src, i) => (
            <img key={i} src={src} alt="" className="aspect-square w-full rounded-lg object-cover" />
          ))}
        </div>
      );

    case "video":
      return (
        <video controls className="w-full rounded-xl" poster={String(config.poster ?? "")}>
          <source src={String(config.src ?? "")} />
        </video>
      );

    case "audio":
      return (
        <audio controls className="w-full">
          <source src={String(config.src ?? "")} />
        </audio>
      );

    case "file_download":
      return (
        <ClickableLink
          username={username}
          blockId={block.id}
          href={url}
          className="inline-block w-full rounded-2xl bg-stone-900 px-4 py-3 text-center text-base font-semibold text-white hover:opacity-90"
        >
          {label || "Download"}
        </ClickableLink>
      );

    case "pdf_viewer":
      return (
        <iframe
          title="PDF"
          src={url}
          className="w-full rounded-xl border"
          style={{ height: Number(config.height ?? 500) }}
        />
      );

    case "html":
      return <HtmlBlock html={String(config.content ?? "")} />;

    case "contact_form":
      return (
        <ContactFormBlock
          username={username}
          title={String(config.title ?? "Contact me")}
          success={String(config.success ?? "Thanks!")}
          themeName={theme?.themeName === "dark" ? "dark" : "light"}
          primary={String(theme?.primaryColor ?? "#000")}
          text={String(theme?.textColor ?? "#000")}
        />
      );

    case "newsletter":
      return (
        <NewsletterFormBlock
          username={username}
          title={String(config.title ?? "Join my newsletter")}
          success={String(config.success ?? "You're subscribed!")}
        />
      );

    case "youtube":
    case "spotify":
    case "tiktok":
    case "instagram":
    case "twitter":
    case "twitch":
    case "vimeo":
    case "maps":
    case "custom_embed": {
      const src = getEmbedSrc(block.type, config);
      if (!src) return null;
      return (
        <div
          className="overflow-hidden rounded-xl bg-black/5"
          style={{
            height:
              block.type === "custom_embed"
                ? Number(config.height ?? 300)
                : undefined,
          }}
        >
          <iframe
            title={block.type}
            src={src}
            className="w-full"
            style={{
              height: block.type === "custom_embed" ? Number(config.height ?? 300) : 240,
              border: 0,
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      );
    }

    default:
      return null;
  }
}

function HtmlBlock({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}