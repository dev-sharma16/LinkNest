# Phase 7 — AI Builder

## Goal

Build the first user-facing AI creation experience for LinkNest.

Users should be able to describe what they want and have LinkNest generate a complete Link in Bio page or Storefront.

---

# Supported Targets

The AI Builder must support:

* Link in Bio
* Storefront

---

# User Input

Users can provide:

* Natural-language description
* Use case
* Reference URL
* Reference images
* Example links
* Uploaded assets

---

# Example

User:

> I'm a fitness creator. Create a premium dark page with Instagram, YouTube, my coaching website and a section containing my recommended gym products.

The AI should generate an appropriate LinkNest design.

---

# Reference URLs

Users can provide reference pages.

The system should extract design characteristics such as:

* layout
* visual hierarchy
* colors
* typography direction
* button style
* card style
* spacing
* background style

The AI must create an original LinkNest-compatible design.

It must not blindly clone third-party websites.

---

# Reference Images

Users may upload:

* screenshots
* moodboards
* design references
* brand references

The AI should use them to understand the visual direction.

---

# Link Understanding

The AI should classify provided URLs when possible.

Example:

```text
Instagram → Social Link
YouTube → Social Link
Website → CTA
Amazon → Storefront Product
```

The user must be able to review the result.

---

# Link in Bio Generation

AI can generate:

* profile
* bio
* social links
* buttons
* headings
* text
* images
* embeds
* contact form
* newsletter
* layout
* theme

---

# Storefront Generation

AI can generate:

* title
* description
* categories
* sections
* product cards
* product ordering
* CTA labels
* theme
* layout

The AI must never invent products or URLs.

---

# Preview

AI generation creates a draft.

It must NOT immediately overwrite the published page.

Workflow:

```text
Generate
 ↓
Draft
 ↓
Preview
 ↓
Apply
```

---

# User Actions

After generation:

* Apply
* Edit
* Regenerate
* Discard
* Save as Preset

---

# AI Loading States

Show meaningful stages such as:

* Understanding request
* Processing references
* Building layout
* Creating theme
* Preparing preview

---

# Mobile

The Builder must work well on mobile.

---

# Completion Criteria

Phase 7 is complete when:

* AI can generate Link in Bio pages.
* AI can generate Storefronts.
* URLs can be supplied.
* Images can be supplied.
* References can be supplied.
* Generated pages use existing components.
* Generated pages are editable.
* Generated pages use the existing renderer.
* Preview works.
* Apply/discard works.
* Errors are handled.
