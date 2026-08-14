"use client";

import { Check } from "lucide-react";
import type { CSSProperties } from "react";
import { themeVars } from "@/lib/bio-css";
import type { ThemeStyleValues } from "@/lib/validations/bio";
import type { ThemePreset } from "@/lib/bio-themes";
import { cn } from "@/lib/utils";

/**
 * Renders a miniature phone mockup of a bio page (or storefront) using the
 * template's real CSS variables, so users can see exactly what they get.
 */
export function PhonePreview({
  theme,
  variant = "bio",
  className,
}: {
  theme: ThemeStyleValues;
  variant?: "bio" | "storefront";
  className?: string;
}) {
  // Note: we intentionally render previews with the shared --bio-* variables
  // (not the --sf-* storefront namespace) so both previews reuse one pipeline.
  const vars = themeVars(theme) as CSSProperties;
  return (
    <div
      className={cn(
        "relative mx-auto aspect-[9/16] w-full max-w-[220px] overflow-hidden rounded-[1.6rem] border-[6px] border-zinc-900/90 shadow-xl",
        className,
      )}
      style={vars}
    >
      {/* status bar */}
      <div className="flex items-center justify-between px-3 pt-2 text-[7px] font-semibold opacity-70">
        <span>9:41</span>
        <span className="h-2 w-8 rounded-full bg-current opacity-60" />
      </div>

      {variant === "storefront" ? (
        <StorefrontMock theme={theme} />
      ) : (
        <BioMock theme={theme} />
      )}
    </div>
  );
}

function BioMock({ theme }: { theme: ThemeStyleValues }) {
  const align = theme.alignment;
  const justify =
    align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";
  const btnStyle = buttonVariant(theme);
  return (
    <div className="px-3 pb-4 pt-3">
      <div className="flex flex-col items-center gap-1.5" style={{ alignItems: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start" }}>
        <div
          className="h-10 w-10 rounded-full border"
          style={{
            background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
            borderColor: `${theme.textColor}33`,
          }}
        />
        <div className="text-[10px] font-bold" style={{ color: "var(--bio-text)" }}>
          Alex Rivera
        </div>
        <div
          className="max-w-[80%] text-[6.5px] leading-tight opacity-75"
          style={{ color: "var(--bio-text)", textAlign: align }}
        >
          Creator • Designer • Coffee enthusiast
        </div>
      </div>

      <div className="mt-2.5 grid gap-1.5" style={{ justifyItems: align === "center" ? "center" : align === "right" ? "end" : "start" }}>
        {["My Portfolio", "Latest YouTube", "Book a call"].map((label) => (
          <div
            key={label}
            className="flex w-full items-center justify-center gap-1 px-2 py-1.5 text-[7px] font-semibold"
            style={{
              ...btnStyle,
              borderRadius: theme.buttonRadius,
              maxWidth: "88%",
            }}
          >
            <span
              className="h-1 w-1 rounded-full"
              style={{ background: btnStyle.color }}
            />
            {label}
          </div>
        ))}
      </div>

      <div
        className="mt-2.5 flex gap-1"
        style={{ justifyContent: justify as never }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <span
            key={i}
            className="h-3.5 w-3.5 rounded-full"
            style={{
              background: i % 2 === 0 ? theme.primaryColor : theme.secondaryColor,
              opacity: 0.9,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function StorefrontMock({ theme }: { theme: ThemeStyleValues }) {
  const btnStyle = buttonVariant(theme);
  return (
    <div className="px-3 pb-4 pt-3">
      <div className="flex items-center gap-2">
        <div
          className="h-7 w-7 rounded-md border"
          style={{
            background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
            borderColor: `${theme.textColor}33`,
          }}
        />
        <div>
          <div className="text-[9px] font-bold" style={{ color: "var(--bio-text)" }}>
            Rivera Studio
          </div>
          <div className="text-[6px] opacity-70" style={{ color: "var(--bio-text)" }}>
            Digital products & prints
          </div>
        </div>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="overflow-hidden rounded-lg"
            style={{
              background: `${theme.backgroundColor}cc`,
              border: `${theme.textColor}1f 1px solid`,
            }}
          >
            <div
              className="h-8"
              style={{
                background:
                  i % 2 === 0
                    ? `linear-gradient(135deg, ${theme.primaryColor}99, ${theme.secondaryColor}99)`
                    : `linear-gradient(135deg, ${theme.secondaryColor}99, ${theme.accentColor}99)`,
              }}
            />
            <div className="p-1">
              <div className="h-1 w-3/4 rounded-full bg-current opacity-50" style={{ color: "var(--bio-text)" }} />
              <div
                className="mt-1 text-[6px] font-semibold"
                style={{ color: btnStyle.color }}
              >
                Buy
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function buttonVariant(theme: ThemeStyleValues): CSSProperties {
  if (theme.buttonStyle === "outline") {
    return {
      background: "transparent",
      color: "var(--bio-btn-bg)",
      border: `1.5px solid var(--bio-btn-bg)`,
    };
  }
  if (theme.buttonStyle === "ghost") {
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

/**
 * A grid of template cards, each with a live phone preview. Clicking a card
 * applies that template's style.
 */
export function TemplateGallery({
  presets,
  activeId,
  onSelect,
  variant = "bio",
}: {
  presets: ThemePreset[];
  activeId: string;
  onSelect: (id: string) => void;
  variant?: "bio" | "storefront";
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
      {presets.map((preset) => {
        const active = activeId === preset.id;
        // Presets never use image backgrounds, so a partial style is safe here.
        const theme = {
          ...preset.style,
          preset: preset.id,
        } as ThemeStyleValues;
        return (
          <button
            key={preset.id}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(preset.id)}
            className={cn(
              "group relative flex flex-col items-center gap-2 rounded-xl border bg-card p-3 pb-2 text-center transition-all duration-200",
              active
                ? "border-primary shadow-md ring-2 ring-primary/60"
                : "border-border hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md",
            )}
          >
            {active ? (
              <span className="absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-3 w-3" />
              </span>
            ) : null}
            <PhonePreview theme={theme} variant={variant} className="w-full max-w-[150px]" />
            <span className="mt-1 text-sm font-semibold">{preset.name}</span>
            <span className="hidden text-[11px] leading-tight text-muted-foreground sm:block">
              {preset.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
