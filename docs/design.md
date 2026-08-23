# LinkNest Design Language

## Overview

LinkNest uses a **neutral, minimal design system** built on shadcn/ui (base-nova style) with Tailwind CSS v4. The admin dashboard follows a monochromatic gray palette, while public-facing pages (Bio, Storefront) support fully customizable user themes.

---

## Admin UI Design

### Color Palette

| Token | Light Mode | Dark Mode |
|-------|-----------|-----------|
| `--background` | `oklch(1 0 0)` white | `oklch(0.145 0 0)` near-black |
| `--foreground` | `oklch(0.145 0 0)` near-black | `oklch(0.985 0 0)` near-white |
| `--primary` | `oklch(0.205 0 0)` dark gray | `oklch(0.922 0 0)` light gray |
| `--secondary` | `oklch(0.97 0 0)` off-white | `oklch(0.269 0 0)` dark gray |
| `--muted` | `oklch(0.97 0 0)` off-white | `oklch(0.269 0 0)` dark gray |
| `--destructive` | `oklch(0.577 0.245 27.325)` red | `oklch(0.704 0.191 22.216)` red |
| `--border` | `oklch(0.922 0 0)` light gray | `oklch(1 0 0 / 10%)` white @ 10% |
| `--ring` | `oklch(0.708 0 0)` gray | `oklch(0.556 0 0)` gray |

### Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| Body | Geist Sans | 400 | 16px (base) |
| Headings | Geist Sans | 500-700 | inherits |
| Monospace | Geist Mono | 400 | inherits |

### Border Radius

Base radius: `0.625rem` (10px)

| Token | Value |
|-------|-------|
| `--radius-sm` | `0.375rem` (6px) |
| `--radius-md` | `0.5rem` (8px) |
| `--radius-lg` | `0.625rem` (10px) |
| `--radius-xl` | `0.875rem` (14px) |
| `--radius-2xl` | `1.125rem` (18px) |

### Component Patterns

#### Buttons
- Variants: `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`
- Sizes: `xs`, `default`, `sm`, `lg`, `icon-*`
- Style: Rounded-lg, border-transparent, transition-all, focus-visible ring

#### Cards
- Border: `ring-1 ring-foreground/10`
- Radius: `rounded-xl`
- Footer: `bg-muted/50` with top border
- Sizes: `default`, `sm`

#### Navigation (Sidebar)
- Fixed left sidebar (264px / `w-64`)
- Nav items: `rounded-lg px-3 py-2` with `hover:bg-muted`
- Active state: `bg-muted text-foreground`
- Mobile: Slide-out Sheet component

#### Forms
- Inputs: Standard shadcn/ui input components
- Validation: Red ring on error (`aria-invalid:border-destructive`)
- Labels: shadcn/ui Label component

### Spacing & Layout

| Context | Value |
|---------|-------|
| Dashboard main content | `max-w-6xl px-4 py-8 md:px-8` |
| Auth pages | `max-w-md` centered |
| Sidebar width | `w-64` (264px) |
| Card spacing | `--spacing(4)` default, `--spacing(3)` for sm |

### Animations

```css
@keyframes bio-rise {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

- Used for entrance animations on public pages
- Duration: `0.5s ease-out`
- Respects `prefers-reduced-motion`

---

## Public Bio Page Design

Bio pages use a **theme variable system** with CSS custom properties.

### Theme Variables

```css
--bio-primary: {primaryColor}
--bio-secondary: {secondaryColor}
--bio-accent: {accentColor}
--bio-text: {textColor}
--bio-btn-bg: {buttonBackground}
--bio-btn-text: {buttonText}
--bio-btn-radius: {buttonRadius}
--bio-spacing: {blockSpacing}
--bio-font-size: {fontSize}
--bio-font-weight: {fontWeight}
--bio-card: {backgroundColor}
--bio-align: {alignment}
```

### Theme Presets

| Preset | Mode | Primary | Style |
|--------|------|---------|-------|
| **Minimal** | Light | `#6366f1` indigo | Clean, centered, 12px radius |
| **Midnight** | Dark | `#818cf8` indigo | Charcoal with violet highlights |
| **Sunset** | Dark | `#fb923c` orange | Ember gradient, pill buttons |
| **Ocean** | Light | `#0ea5e9` sky | Aqua gradient, centered |
| **Forest** | Dark | `#22c55e` green | Pine greens, emerald pop |
| **Rose** | Light | `#e11d48` rose | Blush pink, pill buttons |
| **Neon** | Dark | `#22d3ee` cyan | Electric glow, outline buttons |
| **Cream** | Light | `#b45309` amber | Warm paper, serif type |
| **Editorial** | Light | `#000000` black | Sharp corners, serif, left-aligned |
| **Aurora** | Dark | `#a78bfa` violet | Twilight gradient, pill buttons |

### Button Styles

| Style | Appearance |
|-------|------------|
| `solid` | Filled with `--bio-btn-bg`, text `--bio-btn-text` |
| `outline` | Transparent bg, 2px border in `--bio-btn-bg` |
| `ghost` | Transparent bg, no border, text `--bio-btn-bg` |

### Card Styles

| Style | Appearance |
|-------|------------|
| `shadow` | `color-mix` bg @ 6%, border @ 10%, box-shadow |
| `outlined` | `color-mix` bg @ 4%, border @ 18%, no shadow |
| `flat` | Transparent, no border, no shadow |

### Block Spacing

Default: `12px` between blocks, configurable via `--bio-spacing`

---

## Storefront Page Design

Storefronts extend the bio theme system with additional layout properties.

### Additional Variables

```css
--sf-primary: {primaryColor}
--sf-secondary: {secondaryColor}
--sf-accent: {accentColor}
--sf-text: {textColor}
--sf-btn-bg: {buttonBackground}
--sf-btn-text: {buttonText}
--sf-btn-radius: {buttonRadius}
--sf-card-radius: {cardRadius}     /* default: 16px */
--sf-spacing: {productSpacing}     /* default: 16px */
--sf-font-size: {fontSize}
--sf-font-weight: {fontWeight}
--sf-align: {alignment}
```

### Layout Options

| Layout | Description |
|--------|-------------|
| `grid` | 2-3 column responsive grid (`sm:grid-cols-2 lg:grid-cols-3`) |
| `list` | Single column with horizontal product cards |

### Product Card

- Image: `h-40 w-full object-cover`
- Hover: `-translate-y-1` lift effect
- CTA Button: Full-width, themed with `--sf-btn-*` variables
- Featured badge: `bg-primary/10 text-primary` pill

---

## Icons

**Library**: Lucide React

常用图标:
- Navigation: `LayoutDashboard`, `LinkIcon`, `BarChart3`, `Settings`, `Store`, `UserRound`, `MessagesSquare`
- Actions: `Menu`, `X`, `Plus`, `Trash2`, `Pencil`
- Social: Platform-specific icons

---

## Responsive Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| `sm` | 640px | Grid columns, hidden elements |
| `md` | 768px | Sidebar visible, mobile header hidden |
| `lg` | 1024px | 3-column grids |

---

## Dark Mode

- Implementation: `next-themes` with class strategy
- Toggle: `ThemeToggle` component (Light/Dark/System)
- CSS: `.dark` class on `<html>` element
- Transition: `disableTransitionOnChange` for instant switch

---

## Accessibility

- Focus visible: `focus-visible:ring-3 focus-visible:ring-ring/50`
- Reduced motion: Respects `prefers-reduced-motion`
- ARIA: Proper `aria-label`, `aria-invalid` states
- Keyboard: Full keyboard navigation support

---

## File Structure

```
src/
├── app/
│   ├── globals.css          # Theme variables, base styles
│   ├── layout.tsx           # Root layout with fonts
│   └── (auth)/              # Auth pages (centered layout)
│   └── (dashboard)/         # Dashboard with sidebar
├── components/
│   ├── ui/                  # shadcn/ui primitives
│   ├── dashboard/           # Dashboard shell, nav
│   ├── bio/                 # Bio editor + public views
│   └── storefronts/         # Storefront editor + public views
└── lib/
    ├── bio-themes.ts        # Bio theme presets
    ├── bio-css.ts           # Bio CSS variable generation
    ├── storefront-themes.ts # Storefront presets
    └── storefront-css.ts    # Storefront CSS generation
```
