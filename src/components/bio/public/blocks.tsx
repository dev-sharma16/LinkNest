import { getEmbedSrc, toTheme } from "@/lib/bio-css";
import type { CSSProperties } from "react";
import type { BioBlock } from "@/hooks/use-bio";
import type { ThemeStyleValues } from "@/lib/validations/bio";
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
        .map((block, index) => (
          <BlockView
            key={block.id}
            block={block}
            username={username}
            theme={t}
            index={index}
          />
        ))}
    </div>
  );
}

/** Button background/border/text for the configured buttonStyle. */
function buttonColors(t: ThemeStyleValues): CSSProperties {
  if (t.buttonStyle === "outline") {
    return {
      background: "transparent",
      color: "var(--bio-btn-bg)",
      border: "2px solid var(--bio-btn-bg)",
    };
  }
  if (t.buttonStyle === "ghost") {
    return {
      background: "transparent",
      color: "var(--bio-btn-bg)",
      border: "none",
    };
  }
  return {
    background: "var(--bio-btn-bg)",
    color: "var(--bio-btn-text)",
    border: "none",
  };
}

/** Card surface for the configured cardStyle. */
function cardColors(t: ThemeStyleValues): CSSProperties {
  if (t.cardStyle === "outlined") {
    return {
      background: "color-mix(in srgb, var(--bio-text) 4%, transparent)",
      border: "1px solid color-mix(in srgb, var(--bio-text) 18%, transparent)",
      boxShadow: "none",
    };
  }
  if (t.cardStyle === "flat") {
    return {
      background: "transparent",
      border: "none",
      boxShadow: "none",
    };
  }
  return {
    background: "color-mix(in srgb, var(--bio-text) 6%, transparent)",
    border: "1px solid color-mix(in srgb, var(--bio-text) 10%, transparent)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  };
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
  index,
}: {
  block: BioBlock;
  username: string;
  theme: ThemeStyleValues;
  index: number;
}) {
  const config = (block.config ?? {}) as Record<string, unknown>;
  const label = String(config.label ?? config.title ?? "");
  const url = String(config.url ?? "");
  const entrance = {
    animation: "bio-rise 0.5s ease-out both",
    animationDelay: `${Math.min(index * 60, 480)}ms`,
  } as CSSProperties;

  switch (block.type) {
    case "link":
      return (
        <ClickableLink
          username={username}
          blockId={block.id}
          href={url}
          className="text-center text-base underline underline-offset-4 transition-opacity hover:opacity-70"
          style={entrance}
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
          className="group inline-block w-full px-4 py-3 text-center text-base font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-lg"
          style={{
            ...buttonColors(theme),
            borderRadius: "var(--bio-btn-radius)",
            ...entrance,
          }}
        >
          {label}
        </ClickableLink>
      );

    case "text":
      return (
        <p
          style={{ textAlign: "var(--bio-align)" as never, ...entrance }}
          className="text-base leading-relaxed"
        >
          {String(config.content ?? "")}
        </p>
      );

    case "heading": {
      const content = String(config.content ?? "");
      const level = (config.level ?? "h2") as "h1" | "h2" | "h3" | "h4";
      const Tag = level;
      return (
        <Tag
          style={{ textAlign: "var(--bio-align)" as never, ...entrance }}
          className="font-bold"
        >
          {content}
        </Tag>
      );
    }

    case "divider":
      return (
        <hr
          className="my-2 border-0"
          style={{
            borderTopWidth: 1,
            borderColor: (config.color ||
              "color-mix(in srgb, var(--bio-text) 20%, transparent)") as CSSProperties["borderColor"],
          }}
        />
      );

    case "spacer":
      return <div style={{ height: Number(config.height ?? 16) }} />;

    case "image":
      return (
        <figure style={entrance}>
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
        <div className="grid grid-cols-2 gap-2" style={entrance}>
          {((config.images as string[]) ?? []).map((src, i) => (
            <img key={i} src={src} alt="" className="aspect-square w-full rounded-lg object-cover" />
          ))}
        </div>
      );

    case "video":
      return (
        <video controls className="w-full rounded-xl" poster={String(config.poster ?? "")} style={entrance}>
          <source src={String(config.src ?? "")} />
        </video>
      );

    case "audio":
      return (
        <audio controls className="w-full" style={entrance}>
          <source src={String(config.src ?? "")} />
        </audio>
      );

    case "file_download":
      return (
        <ClickableLink
          username={username}
          blockId={block.id}
          href={url}
          className="inline-block w-full px-4 py-3 text-center text-base font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-lg"
          style={{
            ...buttonColors(theme),
            borderRadius: "var(--bio-btn-radius)",
            ...entrance,
          }}
        >
          {label || "Download"}
        </ClickableLink>
      );

    case "storefront": {
      const slug = String(config.slug ?? "");
      const name = String(config.name ?? "Storefront");
      const coverImage = String(config.coverImage ?? "");
      const storeHref = slug ? `/s/${encodeURIComponent(slug)}` : url;
      return (
        <ClickableLink
          username={username}
          blockId={block.id}
          href={storeHref}
          className="flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          style={{
            ...cardColors(theme),
            borderRadius: "var(--bio-btn-radius)",
            ...entrance,
          }}
        >
          {coverImage ? (
            <img
              src={coverImage}
              alt=""
              className="h-12 w-16 shrink-0 rounded-lg border object-cover"
              width={64}
              height={48}
            />
          ) : null}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-base font-semibold">{name}</span>
            <span className="block text-sm opacity-70">Visit storefront →</span>
          </span>
        </ClickableLink>
      );
    }

    case "pdf_viewer":
      return (
        <iframe
          title="PDF"
          src={url}
          className="w-full rounded-xl border"
          style={{ height: Number(config.height ?? 500), ...entrance }}
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
          themeName={theme.themeName}
          primary={theme.primaryColor}
          text={theme.textColor}
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
            ...entrance,
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