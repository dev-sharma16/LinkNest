---
version: alpha
name: Typeform
website: "https://www.typeform.com"
description: >-
  An AI form-builder canvas anchored on a dark Eggplant ink (`#2a222b`) — neither black nor gray, a warm near-black brown — pulled across the hero band as a full-bleed surface and reused as every text color on the off-white (`#faf9fb`) page floor; the brand voltage is a Get-Real Purple (`#a25fba`) reserved for hover transitions and eyebrow caps, never as a primary button fill. Display headlines run Tobias serif at 80px / weight 400 / -1px tracking on the hero h1; section h2 drops to Twklausanne 350 (a 350-weight TWK-Lausanne cut) at 48px; body and buttons run Twklausanne 400 / 500. The signature move is a 12px-radius dark Eggplant pill CTA paired with a 24px-radius soft-purple gradient panel — the same brand uses two distinct radii to separate action from content.

seo:
  title: "Typeform Design System for React — Eggplant #2a222b, Tobias, 17 components"
  metaDescription: "Typeform's design system as a DESIGN.md file. Eggplant #2a222b, Tobias serif, TWK Lausanne sans, 17 components. For React, Next.js, and AI tools."
  highlights:
    - "Eggplant ink voltage — `#2a222b` carries 785 occurrences as text, hairlines, and the dark hero band; never `#000000`"
    - "Tobias serif on h1 only — 80px / weight 400 / -1px tracking, the editorial gesture in an AI form-builder category dominated by bold sans"
    - "TWK Lausanne 350 on h2 — a 350-weight cut between Light and Regular, 48px display step-down with normal tracking"
    - "Get-Real Purple `#a25fba` reserved for tertiary-hover and eyebrow caps — never the primary CTA fill"
    - "Two-radius shape language — 12px on buttons, 24px on every card and gradient panel; no 16px tier between them"
  tags:
    - "Workflow & No-code"
    - "Marketing & CRM"
  lastUpdated: "2026-05-13"
  author:
    name: "Dov Azencot"
    url: "https://x.com/dovazencot"
  opening: |
    Typeform's marketing canvas opens on a full-bleed Eggplant band (`#2a222b`) — not black, not navy, a warm near-black brown — with a Tobias serif h1 ("Build forms at the drop of a prompt") set at 80px / weight 400 / -1px tracking. A single rounded-rectangle product mockup sits below the headline against the same Eggplant floor, its prompt input field rendered as a soft lavender pill on the dark ground. Below the fold the page flips to an off-white floor (`#faf9fb`) where every other section runs: h2 at 48px in Twklausanne 350, eyebrow caps in `#9454ab` Get-Real Purple, and a 24px-radius gradient panel carrying each product proof point. Where most AI form builders crowd their hero with a saturated mesh gradient or an animated demo, Typeform places one Tobias headline, one Eggplant pill CTA, and one product still-life on a flat dark band.

    This DESIGN.md packages the spec into one machine-readable file. Inside: 23 color tokens grouped into the Eggplant ink ladder, an off-white-to-white surface scale, two purple accents (Get-Real `#a25fba` for the brand voltage and Highlight `#9454ab` for eyebrow text), plus narrow yellow, green, and red token rows pulled from the `_colour-primitives` namespace; 11 typography tokens running Tobias serif from 80px hero h1 down to 64px h2 alt, and Twklausanne (350/400/500/600 weights) from 48px section h2 down to 12px paragraph-xxs; 5 corner radii anchored on 12px (buttons) and 24px (cards), with a 5rem xl tier reserved for the gradient hero panel; 9 spacing tokens stepping on a 4px grid up to 120px section padding; and 17 components covering the Eggplant primary pill, the white outlined secondary, the Tobias hero heading, the gradient feature panel, the integration tile row, the stat block, and the off-white footer. Format follows the Google Labs DESIGN.md spec.

    Feed the file to Claude, Cursor, or Copilot and the agent will reproduce Typeform's discipline — Eggplant over off-white, Tobias confined to the hero h1, TWK Lausanne everywhere else, purple held back from the primary CTA — instead of a generic shadcn theme. Reference the tokens directly inside Tailwind config, CSS variables, or your own component library. The discipline worth studying is the two-radius rule: a 12px pill on every button and a 24px corner on every card or gradient panel, with nothing in between. That binary geometry is what lets a dense AI form-builder page read as a marketing site rather than a product dashboard.
  related:
    - href: "/design"
      title: "Browse all design systems"
      description: "The full directory of DESIGN.md files on shadcn.io, with live mockups for each."
    - href: "https://www.typeform.com"
      title: "Typeform — official site"
      description: "Typeform's AI form-builder platform, the source for every token in this spec."
    - href: "https://github.com/google-labs-code/design.md"
      title: "The DESIGN.md specification"
      description: "Google Labs' open spec for machine-readable design system files — the format this page is built on."
  questions:
    - id: "primary-color"
      title: "What is Typeform's primary brand color?"
      answer: "Two colors carry the brand. The system primary is Eggplant (`#2a222b`) — a warm near-black brown that appears 785 times across the inspected page as text (389), hairlines (389), and the dark hero band (7 background fills). It is the primary CTA fill, every text label, every button stroke. The brand voltage is Get-Real Purple (`#a25fba`), tagged `brand` layer by the extractor and wired to `--tokens--button--tertiary-hover` and the `_colour-primitives---get-real--700` ramp. Purple appears only on hover transitions of tertiary actions and inside gradient panels — it is never the rest-state fill of the primary CTA, which is always Eggplant."
    - id: "typography"
      title: "What fonts does Typeform use, and what should I substitute?"
      answer: "Two families. Tobias (a high-contrast serif by Klim Type Foundry) is reserved for the hero h1 at 80px / weight 400 / -1px tracking, with two related tiers at 72px and 64px / -2px tracking on alternate section heads. TWK Lausanne carries every other word on the page in four weight cuts — 350 for the 48px section h2, 400 for body and paragraphs, 500 for buttons and action text, 600 for eyebrow caps. Tobias is licensed from Klim; reasonable open substitutes are GT Sectra, Tiempos Headline, or Source Serif. TWK Lausanne's closest free swap is Inter at weight 350/400/500/600 with letter-spacing left at 0 — TWK's distinctive feature is the 350 mid-weight, which Inter approximates with its Light-to-Regular variable axis."
    - id: "dark-band"
      title: "Why is the hero band Eggplant instead of black?"
      answer: "Eggplant (`#2a222b`) is a deliberate warm-brown departure from `#000000`. The CSS variable `--_colour-primitives---primitives--neutral--1000` resolves to `#2a222b`, and the variable `--tokens--surfaces--invert-idle` (used on the inverse band) points at the same hex. Pure black appears in the extracted data only twice — both inside `--tokens--tag--tag-bg-idle` and `--tag--shadow-colour`, neither of which lights up on the home page. Eggplant pairs with the off-white `#faf9fb` page floor below the fold to keep the canvas-to-band contrast warm; a `#000000` hero on `#faf9fb` would read as harsh, and Typeform's voice is people-friendly rather than fintech."
    - id: "two-radius"
      title: "Why does Typeform use 12px buttons and 24px cards with nothing in between?"
      answer: "It is a deliberate two-tier shape language. The CSS variables `--_size-and-spacing---tokens--corner-radius--xs` resolves to 4px, `--corner-radius--sm` to 12px, and `--corner-radius--md` to 24px — but only 12px (`button-primary` borderRadius) and 24px (the 86-occurrence dominant value on every card, panel, gradient block, and integration tile) actually appear in the rendered components. There is no 16px tier in use. The 12px-or-24px binary is what separates interactive elements (12px) from content surfaces (24px) at a single glance, and it is why a Typeform page never produces the medium-rounded `8–10px` look common to Stripe, Linear, or Vercel."
    - id: "purple-role"
      title: "Where does the Get-Real Purple #a25fba actually appear?"
      answer: "Three places only. First, the `--tokens--button--tertiary-hover` token — tertiary action buttons flip from Eggplant to `#a25fba` on hover. Second, the `_colour-primitives---get-real--700` ramp — used inside the brand's gradient panels (the soft-lavender card background on the hero product mockup is the `get-real--400` `#f3e4fb` tint, with `--get-real--500/--600` sitting at `#b66dd5` and `#b96dd5`). Third, a darker sibling Highlight Purple `#9454ab` (`--tokens--text-colour--text-colour-highlight`) carries the eyebrow caps such as 'AI ENGAGEMENT PLATFORM' and 'DATA COLLECTION'. The primary CTA fill is always Eggplant; purple never owns a rest-state primary action."
    - id: "use-in-project"
      title: "How do I use this DESIGN.md to build a React form-builder site?"
      answer: "Feed the file to Claude, Cursor, or any agent that reads structured tokens — the AI will reproduce Typeform's two-radius discipline (12px buttons, 24px cards), the Eggplant-over-off-white surface ladder, and the Tobias-on-h1-only typographic restraint instead of a generic shadcn theme. You can also reference the 23 color tokens, 11 typography styles, and 17 components directly: every value is a quoted hex or size you can paste into Tailwind config, CSS variables, or your own component library. Combine the file with shadcn/ui primitives for a fast Next.js setup."

colors:
  primary: "#2a222b"
  primary-hover: "#564b58"
  on-primary: "#faf9fb"
  ink: "#2a222b"
  ink-soft: "#3e3040"
  ink-muted: "#655d67"
  ink-subtle: "#837a85"
  ink-faint: "#a49da6"
  canvas: "#faf9fb"
  surface-1: "#ffffff"
  surface-2: "#f5f3f6"
  surface-3: "#eeecee"
  surface-gradient-soft: "#f7edfc"
  inverse-canvas: "#2a222b"
  inverse-ink: "#faf9fb"
  hairline: "#e5e1e5"
  hairline-strong: "#d4d1d5"
  accent-purple: "#a25fba"
  accent-purple-deep: "#753a88"
  accent-purple-300: "#ddb7f0"
  highlight-text: "#9454ab"
  shadow-ink: "#000000"
  selection: "#c6b8fe"

typography:
  display-xl:
    fontFamily: "Tobias, Times New Roman, Georgia, serif"
    fontSize: 80px
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-1px"
  display-lg:
    fontFamily: "Tobias, Times New Roman, Georgia, serif"
    fontSize: 72px
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-1px"
  display-md:
    fontFamily: "Tobias, Times New Roman, Georgia, serif"
    fontSize: 64px
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-2px"
  heading-h2:
    fontFamily: "Twklausanne 350, Arial, Helvetica, sans-serif"
    fontSize: 48px
    fontWeight: 350
    lineHeight: 1.1
    letterSpacing: "0px"
  subhead:
    fontFamily: "Twklausanne 500, Arial, Helvetica, sans-serif"
    fontSize: 24px
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "0px"
  body-lg:
    fontFamily: "Twklausanne 350, Arial, Helvetica, sans-serif"
    fontSize: 20px
    fontWeight: 350
    lineHeight: 1.3
    letterSpacing: "0px"
  body-md:
    fontFamily: "Twklausanne 400, Arial, Helvetica, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "0px"
  body-sm:
    fontFamily: "Twklausanne 400, Arial, Helvetica, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "0px"
  button:
    fontFamily: "Twklausanne 500, Arial, Helvetica, sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0px"
  eyebrow:
    fontFamily: "Twklausanne 600, Arial, Helvetica, sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0px"
    textTransform: uppercase
  caption:
    fontFamily: "Twklausanne 400, Arial, Helvetica, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "0px"

rounded:
  none: "0px"
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "24px"
  xl: "80px"
  full: "9999px"

spacing:
  xxs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
  section: "80px"
  hero: "120px"

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    borderColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
    height: "40px"
    border: "0"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
    borderColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
    height: "40px"
    border: "0"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    borderColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
    height: "40px"
    border: "1px"
  button-secondary-hover:
    backgroundColor: "{colors.surface-3}"
    textColor: "{colors.ink}"
    borderColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
    height: "40px"
    border: "1px"
  button-tertiary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
    height: "40px"
    border: "0"
  button-tertiary-hover:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.accent-purple}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
    height: "40px"
    border: "0"
  hero-heading:
    backgroundColor: "{colors.inverse-canvas}"
    textColor: "{colors.inverse-ink}"
    typography: "{typography.display-xl}"
    rounded: "{rounded.none}"
    padding: "0"
  section-heading:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.heading-h2}"
    rounded: "{rounded.none}"
    padding: "0"
  eyebrow-label:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.highlight-text}"
    typography: "{typography.eyebrow}"
    rounded: "{rounded.none}"
    padding: "0"
  top-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    padding: "16px 32px"
    height: "72px"
    border: "0"
  nav-link:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    padding: "0"
    height: "24px"
    border: "0"
  hero-band:
    backgroundColor: "{colors.inverse-canvas}"
    textColor: "{colors.inverse-ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    padding: "80px 32px"
  promo-strip:
    backgroundColor: "{colors.inverse-canvas}"
    textColor: "{colors.inverse-ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: "16px 32px"
    height: "48px"
  feature-card:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: "32px"
    border: "1px"
    borderColor: "{colors.hairline}"
  gradient-panel:
    backgroundColor: "{colors.surface-gradient-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: "48px"
    border: "0"
  integration-tile:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.xl}"
    padding: "16px 32px"
    height: "56px"
    border: "1px"
    borderColor: "{colors.hairline}"
  stat-block:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.display-md}"
    rounded: "{rounded.none}"
    padding: "0"
  text-input:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline-strong}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
    height: "44px"
    border: "1px"
  footer:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.none}"
    padding: "64px 32px"
    border: "0"
---

## Overview

Typeform's marketing chrome is the rare AI form-builder surface that opens on a warm dark band instead of a saturated gradient. The hero is a full-bleed Eggplant rectangle (`{colors.inverse-canvas}` `#2a222b`) — neither black nor navy, a warm near-black brown wired to `--_colour-primitives---primitives--neutral--1000` — with one Tobias serif h1 ("Build forms at the drop of a prompt") set at 80px / weight 400 / -1px tracking, and one Eggplant pill CTA labeled "Get started — it's free" floating below it in a 12px-radius rectangle. The product mockup sits inside the same dark band as a single still-life: a haircare bottle, a prompt input field on a softened lavender pill, and a wireframe of the resulting form. Below the fold the page flips to off-white (`{colors.canvas}` `#faf9fb`) where every section runs on white feature cards, soft-purple gradient panels (`{colors.surface-gradient-soft}` `#f7edfc`), and Twklausanne 350 section heads at 48px.

**Two-radius geometry**: where most SaaS pages run a 3-tier rounding scale (4 / 8 / 16 / 24), Typeform compresses to two: 12px on every interactive element (every button across the page is the same `{rounded.md}` `12px`) and 24px on every content surface (the dominant radius at 86 occurrences). There is no 16px middle tier in the rendered components. The shape grammar makes action-versus-content readable from a thumb's width away — a discipline that holds even across the integration row, where every tile sits at the same 24px or 80px pill radius and nothing in between.

**Eggplant-as-ink**: where most platforms either pick `#000000` or pick a true gray-900, Typeform picks `#2a222b` — a warm brown-toned near-black that sits at L 0.26 / C 0.020 in OKLCH space. The Eggplant carries 785 occurrences across text (389), borders (389), and dark-band fills (7). Pairing it with the off-white `#faf9fb` page floor (which itself is L 0.98 / C 0.003) gives the canvas a warm paper quality that pure `#000000` on `#ffffff` cannot produce. The brand voltage — Get-Real Purple `#a25fba` — is intentionally held back from the primary action and surfaces only on tertiary hover and gradient panel tints.

**Key Characteristics:**
- **Eggplant primary** (`{colors.primary}` `#2a222b`) carries 785 occurrences as the text, hairline, and dark-band color; the primary CTA is filled with the same hex, never `#000000`.
- **Tobias serif on h1 only** at 80px / weight 400 / -1px tracking — every other tier is Twklausanne sans.
- **TWK Lausanne 350** (a 350-weight cut between Light and Regular) carries the section h2 at 48px; weight 400 carries body; weight 500 carries buttons; weight 600 carries eyebrows.
- **12px buttons, 24px cards** — the two-radius rule, with no 16px tier in between.
- **Highlight Purple** (`{colors.highlight-text}` `#9454ab`) carries every eyebrow cap ("AI ENGAGEMENT PLATFORM", "DATA COLLECTION", "NEW: CONTACTS & AUTOMATIONS") at 14px / weight 600 / uppercase.
- **Soft lavender gradient panels** (`{colors.surface-gradient-soft}` `#f7edfc`) at 24px radius carry product proof points on the off-white floor — the rare case where the purple ramp surfaces below the fold.
- **40px-tall buttons** — short by SaaS-page standards, paired with `12px 20px` padding. Inputs sit at 44px to mirror form-field rhythm.

## Colors

Typeform's palette is one warm near-black ink plus a narrow purple voltage on a warm-paper ladder. The 23 tokens fall into the Eggplant ink ladder, an off-white surface scale, two purple accents, and a hairline tier.

- **Eggplant (`#2a222b`)** — frequency 785. Used as text (389), border (389), bg (7). The system primary, wired to `--_colour-primitives---primitives--neutral--1000`, `--tokens--text-colour--text-colour-primary`, `--tokens--button--primary-bg-idle`, `--tokens--surfaces--invert-idle`. Not black, not gray — a warm near-black brown that carries the dark hero band and every text label.
- **Off-white (`#faf9fb`)** — frequency 506. Used as text (205, on inverse surfaces), bg (96), border (205). Wired to `--_colour-primitives---primitives--neutral--25` and `--tokens--surfaces--background-idle`. The page floor below the hero band, and the on-primary text color inside the Eggplant CTA.
- **Highlight Purple (`#9454ab`)** — frequency 6. Used as text (3), border (3). The single token wired to `--tokens--text-colour--text-colour-highlight`. Scoped to eyebrow caps ("AI ENGAGEMENT PLATFORM", "DATA COLLECTION") — never a button background.
- **Get-Real Purple (`#a25fba`)** — frequency 0 in the rendered top scan but layer `brand` per the extractor's CSS-variable classification. Wired to `--tokens--button--tertiary-hover` and `--_colour-primitives---get-real--700`. The brand voltage, reserved for tertiary-button hover transitions and gradient-panel deep tints. The single hex tagged `layer: brand` in the JSON.
- **Eggplant-soft (`#3e3040`)** — frequency 1. Used as bg (1). The `--_colour-primitives---primitives--neutral--900` step. A one-occurrence dark tint that the system holds back for inverse-on-dark subtle backgrounds.
- **Eggplant-hover (`#564b58`)** — frequency 0 raw but wired to `--tokens--button--primary-bg-hover` and `--_colour-primitives---primitives--neutral--800`. The primary CTA hover fill — the Eggplant lifts one neutral step toward warm gray.
- **Ink-muted (`#655d67`)** — frequency 0 raw, wired to `--tokens--text-colour--text-colour-secondary`. The secondary body text color used on footer rows and supporting copy.
- **Ink-subtle (`#837a85`)** — wired to `--_colour-primitives---primitives--neutral--600`. A tertiary neutral for disabled labels and chart-axis ink.
- **Surface-2 (`#f5f3f6`)** — wired to `--tokens--surfaces--background-active` and `--surfaces--foreground-hover`. The active-state background under nav-link presses and card-hover states.
- **Surface-3 (`#eeecee`)** — wired to `--tokens--surfaces--foreground-active` and `--tokens--button--secondary-bg-hover` / `--tokens--tag--tag-bg-hover`. The hover-fill on secondary buttons and tags.
- **Surface-gradient-soft (`#f7edfc`)** — wired to `--_colour-primitives---primitives--purple--200` and `--_colour-primitives---get-real--400`. The soft-lavender card tint used on the "DATA COLLECTION" proof panel below the hero.
- **Accent-purple-300 (`#ddb7f0`)** — frequency 2. Used as text (1), border (1). The `--_colour-primitives---primitives--purple--400` step, used inside gradient panel decorations.
- **Accent-purple-deep (`#753a88`)** — wired to `--_colour-primitives---primitives--purple--800`. The deepest purple in the ramp, reserved for the gradient panel's far edge.
- **Hairline (`#e5e1e5`)** — wired to `--tokens--border--border-primary` and `--_colour-primitives---primitives--neutral--200`. The 1px card and input divider color.
- **Hairline-strong (`#d4d1d5`)** — wired to `--_colour-primitives---primitives--neutral--300`. A heavier divider for input strokes and card-edge contrast.
- **Selection (`#c6b8fe`)** — wired to `--_colour-primitives---primitives--lavender--400`. A soft lavender highlight used on the hero product mockup's input field — text-selection style.

## Typography

Typeform runs two families, separated by job. Tobias is reserved for the hero h1 and two alternate display tiers; TWK Lausanne handles every other word on the page, across four weight cuts.

**Tobias** (Klim Type Foundry) carries the hero h1 at 80px / weight 400 / -1px tracking — a high-contrast editorial serif. Two related Tobias tiers exist: `display-lg` at 72px / weight 400 / -1px (used on alternate section heads with the same line-height-1 ratio), and `display-md` at 64px / weight 400 / -2px tracking / 1.1 line-height (used on stat-block numbers like "3.5x more data"). The serif is never set above weight 400; the personality lives in the typeface, not the weight axis.

**TWK Lausanne** carries everything else across four cuts: 350 for the 48px section h2 (`heading-h2`) and the 20px body-lg paragraph, 400 for 16px body and 14px supporting copy, 500 for 16px buttons and 24px subheads, 600 for the 14px uppercase eyebrow caps. Letter-spacing on every Lausanne tier stays at 0 — negative tracking is reserved for the Tobias display tiers. The 350 weight (between Light and Regular) is TWK's distinctive feature; it gives the 48px h2 a quiet authority that a 400-weight equivalent would lose.

**Restraint as confidence**: where most AI platforms push display headlines to weight 600 or 700, Typeform holds the entire heading hierarchy at weight 400 or 350. The brand trusts the serif on h1 and the 350 mid-weight on h2 to carry attention; bold weights only appear at the 14px eyebrow tier, where they need to compete with the surrounding sans body.

## Layout

The page runs on a 4px spacing grid with two heavy section gutters. The most-used spacing value is `16px 32px` (81 occurrences) — vertical / horizontal padding for buttons, top-nav containers, and inline pill components. `{spacing.xs}` `8px` (46) handles the inline gap between nav items, button icon-and-label pairs, and card-interior rows. `{spacing.md}` `16px` (43) is the standard card-interior gutter and the gap between feature panel headlines and their supporting copy. `{spacing.xl}` `32px` (28) carries section-edge padding and the gap between integration tiles.

Asymmetric horizontal padding `0px 48px` shows up 11 times, all on the off-white section containers wrapping the gradient panels — Typeform indents content rows from the page edge while keeping the panels themselves at full container width. Section padding lives at `{spacing.section}` `80px` (also 5 occurrences as `80px 0px`) and `{spacing.hero}` `120px` for the gap between the dark hero band and the first off-white section. The CSS variable `--_size-and-spacing---primitives--section-spacing--section-padding-xlarge` resolves to `7.5rem` (120px).

The site uses a 1280px standard column (`--max-width--medium` at 80rem). Above-the-fold, the dark hero band spans full-width; below-the-fold every section snaps to the same 1280px column with `32px` side padding. There are no decorative slope dividers or wave SVGs between sections — the only transition between bands is a color flip from Eggplant to off-white, or from off-white card to lavender gradient panel.

## Elevation & Depth

**Surface-ladder-over-shadow**: Typeform does not lean on drop shadows for depth. Cards lift via surface contrast — white (`{colors.surface-1}` `#ffffff`) feature cards on the off-white (`#faf9fb`) page floor, plus 1px `{colors.hairline}` `#e5e1e5` borders to define the edge. The CSS extraction surfaced one shadow occurrence inside `--tag--shadow-colour` (`transparent`) — meaning the system actively declares a no-shadow value rather than inheriting a default.

The hero product mockup is the single exception: a haircare bottle and a wire-mocked form sit on the Eggplant band with a faint cast — the screenshot reads as a soft-blurred halo around the central prompt input, likely a `0px 0px 4px` blur (the system declares this exact spacing value 5 times). The blur is rendered against the dark band rather than a light surface, which is why it reads as atmospheric glow rather than a card-lift shadow.

Below the fold, the soft lavender gradient panels (`{colors.surface-gradient-soft}` `#f7edfc`) carry their own depth via tint rather than via shadow — the lavender-on-off-white contrast is enough to lift the panel away from the page floor without an additional shadow.

## Shapes

**Two-radius rule**: the brand owns two values and uses nothing in between. `{rounded.md}` `12px` is the button radius — every interactive button across the home page (`button-primary`, `button-secondary`, `button-tertiary`) uses the same 12px corner. `{rounded.lg}` `24px` (86 occurrences, the dominant radius value) is the card radius — every feature panel, gradient panel, product mockup container, and integration row uses 24px.

A third tier, `{rounded.xl}` `80px` (`--_size-and-spacing---tokens--corner-radius--xl` resolves to 5rem), appears once on the integration-tile pill at the bottom of the integrations row — the 56px-tall tile uses an 80px radius to read as a fully-rounded soft pill instead of a rectangle. There is no `{rounded.full}` `9999px` use on the home page; the 80px tier covers the "pill" geometry the brand needs.

The 8px (`{rounded.sm}`) and 4px (`{rounded.xs}`) tiers exist as CSS variables but do not appear in the rendered components on the home page. The shape grammar is binary on purpose: action versus content, with the 80px tile as a single exception for the integration row.

## Components

The system documents 17 components, each anchored to declared tokens. Buttons and the dark hero band carry the brand identity; gradient panels and integration tiles carry the rhythm below the fold.

- `button-primary` — the Eggplant pill CTA. `{colors.primary}` `#2a222b` fill, `{colors.on-primary}` `#faf9fb` text, 12px radius, `12px 20px` padding, 40px height. The single load-bearing brand action.
- `button-primary-hover` — fill shifts one neutral step to `{colors.primary-hover}` `#564b58`. Everything else stays.
- `button-secondary` — off-white fill, Eggplant text, 1px Eggplant stroke, same 12px pill geometry. Used as the inline "Log in" action in the top nav and as the dark-band hero counterpart.
- `button-secondary-hover` — fill shifts to `{colors.surface-3}` `#eeecee`. Stroke stays Eggplant.
- `button-tertiary` — no border, off-white fill, Eggplant text. The neutral tertiary tier.
- `button-tertiary-hover` — fill stays off-white, text flips to `{colors.accent-purple}` `#a25fba`. The single rest-to-hover transition where purple lights up.
- `hero-heading` — Tobias display-xl at 80px / weight 400 / -1px tracking. White text on the Eggplant band.
- `section-heading` — TWK Lausanne 350 at 48px / weight 350 / 1.1 line-height. Eggplant text on off-white canvas.
- `eyebrow-label` — 14px / weight 600 / uppercase TWK Lausanne in `{colors.highlight-text}` `#9454ab`. Placed above every section h2 ("AI ENGAGEMENT PLATFORM", "DATA COLLECTION", "INTEGRATIONS", "NEW: CONTACTS & AUTOMATIONS").
- `top-nav` — off-white surface, 72px height, `16px 32px` horizontal padding, Eggplant nav labels at 16px / weight 400.
- `nav-link` — 24px hit area, 16px / weight 400 sans, Eggplant text, transparent background, no radius.
- `hero-band` — Eggplant full-bleed surface with `80px 32px` padding. Carries the Tobias h1, the eyebrow ("AI ENGAGEMENT PLATFORM"), the primary CTA, and the product mockup.
- `promo-strip` — Eggplant strip at the top of the page (48px height) carrying the "Typeforum Spring 2026" announcement at 16px / weight 400 / off-white text.
- `feature-card` — white card on off-white canvas, 24px radius, 32px padding, 1px hairline border. Used in feature-grid sections.
- `gradient-panel` — `{colors.surface-gradient-soft}` `#f7edfc` lavender tint, 24px radius, 48px padding, no border. Carries the "DATA COLLECTION" and "Trigger action" proof rows.
- `integration-tile` — white pill with 80px radius and a 1px hairline border. Houses single-logo integrations (Calendly, CallRail, Intercom, Klaviyo, Slack, Stripe, Zapier, Webflow). Height 56px, `16px 32px` padding.
- `stat-block` — Tobias 64px / -2px tracking display-md numbers ("96%", "95%", "87%") stacked over 14px / weight 400 TWK Lausanne body-sm captions ("have a better brand experience", "gather more data, more easily").
- `text-input` — white fill, 1px `{colors.hairline-strong}` `#d4d1d5` stroke, 12px radius, `12px 16px` padding, 44px height. Mirrors button height on form rows.
- `footer` — off-white canvas, `{colors.ink-muted}` `#655d67` text at 12px caption tier, `64px 32px` padding, no radius, no border.

## Do's and Don'ts

**Do** use `{colors.primary}` `#2a222b` Eggplant for every text color, not `#000000`. Pure black appears in the extracted data only twice — both inside tag-component overrides — and never on system-authored body text. The Eggplant warmth is what pairs with the off-white canvas.

**Do** keep Tobias inside the hero h1 (and the two alternate display tiers). Setting body or 16px copy in Tobias inverts the system — the serif's job is editorial display, not paragraph rhythm.

**Do** use 12px on every button and 24px on every card or panel. The two-radius rule is what makes the page read as Typeform rather than Stripe (4–8px) or Linear (8–12px).

**Do** reserve the Highlight Purple `{colors.highlight-text}` `#9454ab` for eyebrow caps only. The pattern across the home page is one eyebrow per section ("AI ENGAGEMENT PLATFORM", "DATA COLLECTION") at 14px / weight 600 / uppercase, sitting above the h2.

**Don't** swap the `#a25fba` Get-Real Purple onto the primary CTA fill. The brand voltage is wired to `--tokens--button--tertiary-hover` — its job is the rest-to-hover transition on the tertiary action, not the rest-state of the primary. A purple-filled primary button breaks the system's discipline that Eggplant always owns the load-bearing action.

**Don't** use a 16px radius on anything. The two-radius binary (12px / 24px) is enforced across every rendered component on the home page; the `8px` and `4px` tiers exist as CSS variables but do not light up on the marketing surface, and adding a 16px tier between the two collapses the action-versus-content readability.

**Don't** pair Tobias with weight 500 or above. Every Tobias tier in the extracted typography array sits at weight 400; pushing the serif heavier turns it from editorial into generic display and breaks the 80px h1 / 48px h2 weight relationship.

**Don't** push body-md or body-sm letter-spacing below 0. The TWK Lausanne body tiers all carry `letterSpacing: 0`; negative tracking is reserved for Tobias display only, and tightening sans body below 16px collapses readable rhythm.

**Don't** use `#000000` shadow casts on cards lifted off the off-white canvas. The system uses surface contrast (white card on `#faf9fb`) plus 1px `{colors.hairline}` borders for elevation; introducing a pure-black drop shadow reads as a different brand category (fintech, dashboard SaaS) and breaks the warm-paper rhythm.

## Known Gaps

- Form-field error and validation states are not captured — the inspected page renders no error styling beyond the focused Eggplant stroke.
- The `text-input` component is reconstructed from observed pricing-page form rows; the live signup form was not in the extracted snapshot.
- Animation and transition timings were not surfaced in the extraction; a 150–200ms ease is a safe default for hover transitions.
- The `_colour-primitives---get-real--400/--500/--600/--700/--800` ramp is documented in the CSS variables but only `--get-real--400` (`#f3e4fb`) and `--get-real--700` (`#a25fba`) light up in the rendered components on the home page; the intermediate steps may surface on `/product` or `/pricing` surfaces not in scope.
- Tobias and TWK Lausanne are licensed from Klim Type Foundry; open-source substitutes (GT Sectra or Tiempos Headline for the serif, Inter for the sans) preserve the proportions but lose the 350-weight cut that defines the h2 tier.
- A dark theme is not documented beyond the single Eggplant hero band and promo strip — the rest of the marketing site is light-only.
