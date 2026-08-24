# Phase 6 — AI Builder & Custom Preset System

## Goal

Build LinkNest's AI-powered Builder and Custom Preset System that dramatically reduces the manual work required to create and design Link in Bio pages and Storefronts.

The system should allow creators to describe what they want in natural language, provide reference websites, images, links, and examples, and have LinkNest automatically generate a complete page design.

The AI Builder must work with both:

* Link in Bio
* Storefront

The system should also allow users to manually design a page, save that design as a reusable Custom Preset, and later apply the preset to other Link in Bio pages or Storefronts.

The result should be a hybrid system:

**Manual Builder + AI Builder + Reusable Custom Presets**

---

# Core Product Idea

Currently, users must manually configure:

* Colors
* Fonts
* Backgrounds
* Buttons
* Cards
* Layout
* Spacing
* Blocks
* Products
* Links
* Images
* Sections
* Content
* Storefront structure

Phase 6 introduces an AI layer that can perform much of this work automatically.

The user should be able to provide a high-level instruction such as:

> Create a dark, premium fitness creator page with my social links, coaching link, YouTube, and recommended gym products.

The AI should determine:

* Appropriate layout
* Theme
* Colors
* Typography
* Button style
* Card style
* Background
* Block arrangement
* Product arrangement
* Content structure
* Visual hierarchy
* CTA placement

The user should then be able to review the result and manually modify anything.

---

# Objectives

The system must allow users to:

* Generate Link in Bio pages using AI
* Generate Storefronts using AI
* Describe their desired design in natural language
* Provide reference URLs
* Provide reference images
* Provide example links
* Provide their own images/assets
* Explain their use case
* Generate layouts automatically
* Generate compatible themes automatically
* Generate content structure automatically
* Generate product cards for Storefronts
* Generate blocks for Link in Bio
* Preview AI-generated results
* Edit AI-generated results manually
* Regenerate specific parts
* Save generated designs as Custom Presets
* Save manually created designs as Custom Presets
* Reuse Custom Presets
* Apply Custom Presets to Link in Bio pages
* Apply Custom Presets to Storefronts

---

# Product Architecture

Phase 6 consists of four major systems.

## 1. AI Builder

Natural-language interface used to generate a page.

## 2. Reference Understanding

System responsible for understanding:

* Reference URLs
* Reference images
* Example links
* User-provided assets
* User instructions

## 3. Page Generation Engine

Converts AI output into valid LinkNest blocks, themes, layouts, and storefront/product structures.

## 4. Custom Preset System

Allows both manually created and AI-generated designs to be saved and reused.

---

# Supported Builders

The AI Builder must support two generation targets.

## Link in Bio Builder

AI can generate:

* Profile configuration
* Bio
* Social links
* Buttons
* Text blocks
* Heading blocks
* Image blocks
* Video blocks
* Audio blocks
* Embeds
* Contact blocks
* Newsletter blocks
* Dividers
* Spacers
* Block ordering
* Theme
* Layout
* Typography
* Background
* Button styles
* Card styles
* Spacing
* Alignment

---

# Storefront Builder

AI can generate:

* Storefront title
* Storefront description
* Storefront structure
* Product sections
* Product cards
* Product titles
* Product descriptions
* Product images
* External URLs
* CTA labels
* Featured products
* Product ordering
* Theme
* Layout
* Typography
* Background
* Button style
* Card style
* Spacing

The AI must never create fake products or fake external URLs.

If the user provides product URLs, the system should use those URLs.

If product information can be safely extracted from a provided public URL, the system may use the extracted information.

If information cannot be verified, the AI should ask the user or leave the field requiring confirmation.

---

# AI Builder User Experience

The AI Builder should be accessible from both:

* Link in Bio
* Storefront

The user should select:

**Create with AI**

or

**Build Manually**

---

# AI Builder Interface

The AI Builder should contain a conversational creation interface.

## Main Input

Provide a large natural-language input.

Example:

> I'm a fitness creator. I want a premium dark theme with my Instagram, YouTube, coaching website, and a section containing my recommended gym products. Keep it minimal and mobile-first.

The AI should interpret this request and convert it into a structured page specification.

---

# Use Case Input

The user should be able to explain the purpose of the page.

Examples:

* Personal creator page
* Fitness creator
* Gaming creator
* Photographer
* Developer portfolio
* Music artist
* Business creator
* Affiliate storefront
* Beauty recommendations
* Fashion recommendations
* Book recommendations
* Tech gear recommendations

The use case should influence the generated design.

Example:

**Fitness creator**

Possible AI decisions:

* Strong typography
* Dark theme
* High-contrast CTA
* Product recommendation section
* Social links
* Coaching CTA

---

# Reference URL Input

Users can optionally provide one or more reference URLs.

Example:

```text
Reference:
https://example.com/creator-page
```

The purpose is to allow the user to communicate:

> I like the design direction of this page.

The AI should analyze publicly accessible information where technically and legally permitted.

Possible extracted information:

* Overall layout
* Visual hierarchy
* Theme direction
* Color relationships
* Typography style
* Button style
* Card style
* Section structure
* Spacing
* Image usage
* General design patterns

The system must NOT blindly clone the reference website.

Instead, it should generate an original LinkNest-compatible design inspired by the requested characteristics.

---

# Reference Image Input

Users can upload reference images.

Examples:

* Screenshot of another creator page
* Screenshot of a storefront
* Brand moodboard
* Color inspiration
* Typography inspiration
* UI reference

The AI should analyze:

* Dominant colors
* Contrast
* Visual style
* Layout characteristics
* Typography direction
* Card appearance
* Button appearance
* Spacing
* General aesthetic

The generated design should remain an original LinkNest design.

---

# Link Input

The user should be able to provide links they want included.

Example:

```text
Instagram:
https://instagram.com/example

YouTube:
https://youtube.com/@example

Website:
https://example.com

Product:
https://amazon.com/example-product
```

The AI should understand the purpose of each link where possible.

For example:

```text
Instagram → Social Link
YouTube → Social Link
Website → Primary CTA
Amazon → Storefront Product
```

The user must be able to review and edit the interpretation before publishing.

---

# Asset Input

Users can provide:

* Profile image
* Product images
* Brand logo
* Background image
* Promotional images
* Gallery images

The AI may use these assets when generating the page.

The AI should never replace a user-provided asset unnecessarily.

---

# AI Builder Workflow

The generation process should follow this flow:

```text
User Input
     ↓
Understand Request
     ↓
Collect References
     ↓
Analyze Use Case
     ↓
Analyze URLs
     ↓
Analyze Images
     ↓
Build Design Specification
     ↓
Validate Specification
     ↓
Generate LinkNest Blocks
     ↓
Generate Theme
     ↓
Generate Layout
     ↓
Generate Content Structure
     ↓
Render Preview
     ↓
User Review
     ↓
Apply / Regenerate / Edit
```

---

# AI Generation Modes

The system should support different generation modes.

## Generate Full Page

Creates the entire page from scratch.

## Generate Theme

Only generates:

* Colors
* Typography
* Background
* Buttons
* Cards
* Spacing
* Layout

## Generate Layout

Only changes the page structure.

## Generate Content

Creates or organizes page content.

## Generate Section

Creates one specific section.

## Generate Products

Creates storefront product cards from supplied product URLs.

## Restyle Existing Page

Uses the existing page as the base and changes its visual design.

## Improve Design

The AI analyzes the existing page and suggests or applies improvements.

---

# AI Regeneration

Users should not need to regenerate the entire page when they dislike one part.

Examples:

> Make the buttons more modern.

> Change the background to something lighter.

> Make the product cards more premium.

> Move my YouTube CTA above Instagram.

> Make the page feel more minimal.

> Use rounded cards instead of sharp cards.

The AI should modify only the relevant parts whenever possible.

---

# AI Generation Preview

AI-generated pages must never immediately overwrite the user's existing published page.

The system should generate a preview/draft first.

Example:

```text
Current Page
     ↓
AI Generate
     ↓
Generated Draft
     ↓
Preview
     ↓
User Approval
     ↓
Apply to Page
```

The user should be able to:

* Apply
* Discard
* Regenerate
* Edit manually
* Save as Custom Preset

---

# Generated Design Specification

The AI should NOT directly generate arbitrary frontend code.

Instead, it should generate a structured LinkNest design specification.

Example conceptual structure:

```json
{
  "target": "link_in_bio",
  "theme": {},
  "layout": {},
  "blocks": [],
  "metadata": {}
}
```

For Storefront:

```json
{
  "target": "storefront",
  "theme": {},
  "layout": {},
  "sections": [],
  "products": [],
  "metadata": {}
}
```

The backend must validate the generated structure before applying it.

The AI must only use supported LinkNest components.

---

# Component Registry

The AI Builder should use a controlled component registry.

Example:

```text
Button
Text
Heading
Image
Gallery
Video
Audio
Divider
Spacer
Social Links
YouTube Embed
Spotify Embed
Contact Form
Newsletter
Product Card
Product Section
```

The AI cannot invent unsupported component types.

This prevents invalid generated pages.

---

# Design Token System

AI-generated designs must use LinkNest's existing design-token system.

The AI should generate tokens such as:

```text
primaryColor
secondaryColor
accentColor
textColor
backgroundColor
buttonColor
fontFamily
fontSize
fontWeight
buttonStyle
buttonRadius
cardStyle
cardRadius
cardShadow
blockSpacing
alignment
```

This ensures generated designs remain compatible with the existing manual editor.

---

# Manual Builder Integration

AI-generated pages must remain fully editable using the existing manual builder.

Example:

```text
AI Generated Page
       ↓
Manual Editor
       ↓
Change Colors
Change Blocks
Change Products
Change Layout
Change Typography
       ↓
Save
```

AI must never create a separate page system that cannot be edited using the existing builder.

---

# Custom Preset System

Phase 6 introduces a new reusable Custom Preset system.

There should be two ways to create a Custom Preset.

## Method 1 — Manual Preset

A user manually builds a page.

Example:

```text
Create Page
↓
Customize everything manually
↓
Save as Preset
```

The current design becomes a reusable Custom Preset.

---

# Method 2 — AI Preset

The user generates a design using AI.

Example:

```text
AI Builder
↓
Generate Design
↓
Preview
↓
Save as Custom Preset
```

The generated design is stored as a reusable preset.

---

# Custom Preset Library

Create a dedicated:

**Custom Presets**

section.

The library should contain:

* Preset preview
* Preset name
* Description
* Created date
* Updated date
* Creator
* Source
* Target compatibility
* Apply button
* Edit button
* Duplicate button
* Delete button

---

# Preset Source

Every preset should record how it was created.

Possible values:

```text
manual
ai
```

This allows the UI to display:

```text
Created manually
```

or:

```text
Created with AI
```

---

# Preset Compatibility

Presets should specify where they can be used.

Possible compatibility:

```text
link_in_bio
storefront
both
```

A preset designed purely around Link in Bio blocks should not automatically be applied to Storefronts if its structure is incompatible.

However, purely visual presets should be reusable across both systems.

---

# Shared Design Presets

The following design information should be designed to be shared between Link in Bio and Storefront:

* Colors
* Typography
* Background
* Button styles
* Card styles
* Radius
* Shadows
* Spacing
* Alignment

This allows one visual identity to work across the entire LinkNest ecosystem.

Example:

```text
Creator Brand Preset
       ↓
Link in Bio
       +
Storefront
```

Both pages can have the same visual identity.

---

# Preset Application

When applying a preset, the user should choose whether to:

### Apply Theme Only

Preserves existing content and changes visual styling.

### Apply Layout

Changes structure and styling.

### Apply Full Preset

Replaces the compatible design configuration and optionally content structure.

The system must clearly warn the user before destructive changes.

---

# Preset Editing

Users should be able to open a Custom Preset and modify it.

Changes to a preset should NOT automatically modify pages that already use that preset.

Instead:

```text
Preset
 ├── Page A
 ├── Page B
 └── Page C
```

If the preset is edited:

```text
Preset Updated
```

existing pages remain unchanged unless the user explicitly chooses to update them.

---

# Preset Duplication

Users should be able to duplicate presets.

Example:

```text
My Fitness Preset
       ↓
Duplicate
       ↓
My Fitness Preset — Dark
```

This allows creators to create variations.

---

# Preset Gallery

The existing template gallery should be expanded to include:

### Built-in Presets

Official LinkNest templates.

### Custom Presets

Presets created by the user.

### AI Presets

AI-generated designs saved by the user.

The UI should clearly distinguish them.

Example:

```text
Templates

[ Built-in ] [ My Presets ] [ AI Generated ]
```

---

# AI + Preset Workflow

The complete workflow should be:

```text
User describes desired page
        ↓
AI generates design
        ↓
Preview
        ↓
User modifies design
        ↓
Save as Custom Preset
        ↓
Preset Library
        ↓
Reuse anywhere
```

---

# AI + Existing Page Workflow

Users should also be able to start with an existing page.

Example:

```text
Existing Page
      ↓
Ask AI to improve
      ↓
AI analyzes page
      ↓
Generates improved draft
      ↓
Preview
      ↓
Apply
```

Example prompts:

> Make my page look more premium.

> Improve the visual hierarchy.

> Make this better for a fitness creator.

> Make the storefront more conversion-focused.

> Make the design mobile-first.

> Make the cards more consistent.

---

# AI Safety and Validation

AI output must always be validated server-side.

Never trust AI-generated JSON directly.

Validate:

* Component types
* URLs
* Required fields
* Theme values
* Color formats
* Font values
* Layout values
* Product references
* Block references
* Maximum sizes
* Permissions

Invalid AI output must be rejected or repaired before being applied.

---

# URL Validation

All external URLs must be validated.

The system should prevent:

* Malformed URLs
* Unsupported protocols
* Dangerous URLs
* Invalid redirects

Only appropriate external protocols such as HTTPS should be accepted for normal external links.

---

# AI Content Rules

The AI should not invent factual information about:

* Products
* Prices
* Brands
* Reviews
* Product specifications
* Affiliate relationships

If the user supplies a URL, information should be derived from verified input where possible.

If information is unavailable, the AI should use neutral placeholders or ask the user to confirm.

---

# Product Handling

For Storefront generation:

If the user provides:

```text
https://amazon.com/product
https://flipkart.com/product
https://myntra.com/product
```

the system may attempt to identify:

* Product title
* Product image
* Description
* Destination URL

The original external URL must remain the destination.

LinkNest does not:

* Sell the product
* Host inventory
* Process payments
* Manage orders

---

# Reference Design Rules

When a user provides a reference website or screenshot, the AI should extract design characteristics rather than duplicate the exact page.

The generated design should be:

* Original
* LinkNest-compatible
* Editable
* Responsive
* Accessible
* Consistent with LinkNest components

The system should avoid directly copying protected assets, logos, text, or proprietary design elements unless the user has provided the rights/assets for their use.

---

# AI Builder Conversation

The AI Builder should support iterative conversation.

Example:

### User

> Build me a premium dark fitness creator page.

### AI

> I've created a dark fitness-focused layout with strong CTA buttons, social links, and a product recommendation section.

### User

> Make it less aggressive and more minimal.

### AI

Updates the design.

### User

> Add my YouTube link above Instagram.

### AI

Reorders the relevant block.

### User

> Save this as "Fitness Dark".

### AI

Creates the Custom Preset.

---

# AI Builder Context

The AI should have access only to the information required to perform the requested operation.

Possible context:

```text
User Request
Existing Page
Existing Theme
Existing Blocks
Reference URLs
Reference Images
User Assets
Provided Links
Available Components
Available Design Tokens
Target Builder
```

The AI should not receive unnecessary private account information.

---

# AI Operations

The AI Builder should support structured operations instead of regenerating the entire page unnecessarily.

Example conceptual operations:

```text
create_page
update_theme
add_block
remove_block
update_block
move_block
duplicate_block
create_product
update_product
remove_product
update_layout
generate_section
save_preset
```

This makes the AI Builder more reliable and easier to control.

---

# Undo / Versioning

AI changes should support rollback.

Before applying an AI operation, the system should preserve the previous page state.

The user should be able to:

* Undo AI change
* Restore previous version
* Compare versions where practical

---

# Permissions

Only the owner of a page should be able to:

* Generate AI designs
* Apply AI designs
* Save presets
* Edit presets
* Delete presets

The existing LinkNest authentication and authorization system must be reused.

---

# Database Requirements

Add the minimum database structures required for:

## AI Generation

Store:

* Generation ID
* User ID
* Target type
* Prompt
* Generation status
* Generated specification
* Reference metadata
* Created timestamp
* Updated timestamp

Possible status:

```text
pending
processing
completed
failed
cancelled
```

---

# Preset Database

Store:

* Preset ID
* User ID
* Name
* Description
* Source
* Compatibility
* Design specification
* Preview information
* Created timestamp
* Updated timestamp

Source:

```text
manual
ai
```

Compatibility:

```text
link_in_bio
storefront
both
```

---

# Reference Storage

Reference metadata may include:

* Reference URL
* Reference type
* User-provided image
* Analysis status
* Extracted design metadata

Do not permanently store external website content unless required and legally appropriate.

---

# AI Generation Architecture

Use a provider abstraction rather than tightly coupling the feature to one AI provider.

Conceptually:

```text
AI Builder
     ↓
AI Service
     ↓
Provider Adapter
     ↓
LLM Provider
```

This allows the AI provider to change later without rewriting the Builder.

---

# Queue / Async Processing

Simple generations may run synchronously.

Long-running operations such as:

* Multiple URL analysis
* Image analysis
* Large reference processing
* Complex storefront generation

should support asynchronous processing.

The existing Redis/BullMQ infrastructure may be reused where appropriate.

---

# Error Handling

The AI Builder must handle:

* AI provider failure
* Timeout
* Invalid AI output
* URL fetch failure
* Image analysis failure
* Unsupported reference
* Rate limits
* Network failure
* Invalid product URL
* Missing required information

The user should receive a useful error message rather than a generic server error.

---

# Rate Limiting

AI generation must be rate limited.

The system should prevent:

* Abuse
* Accidental repeated generation
* Excessive API costs
* Automated generation attacks

Rate limits should be configurable.

---

# Cost Control

The system should avoid unnecessary AI calls.

Examples:

If the user asks:

> Change button color to red.

Do not regenerate the entire page.

Use a targeted design update.

If the user asks:

> Rebuild my entire page around a luxury fashion aesthetic.

A full generation may be appropriate.

---

# Frontend UX

The AI Builder should feel integrated into the existing LinkNest editor rather than like a separate application.

Recommended interface:

```text
┌──────────────────────────────────────┐
│ AI Builder                           │
│                                      │
│ What do you want to build?           │
│                                      │
│ [ Describe your page...            ] │
│                                      │
│ Reference URL                        │
│ [ https://...                      ] │
│                                      │
│ Reference Images                     │
│ [ Upload ]                           │
│                                      │
│ Your Links                           │
│ [ Add Link ]                         │
│                                      │
│ [ Generate ]                         │
└──────────────────────────────────────┘
```

The generated result should appear beside or below the input depending on screen size.

---

# Mobile UX

The AI Builder must be mobile friendly.

On mobile:

```text
Input
 ↓
Generate
 ↓
Preview
 ↓
Edit
 ↓
Apply
```

The preview should use the same public renderer used by the actual page.

---

# AI Generation Loading State

Generation should provide meaningful progress states.

Example:

```text
Understanding your request...
Analyzing references...
Building layout...
Creating theme...
Organizing content...
Preparing preview...
```

Do not fake progress that does not correspond to actual backend operations.

---

# Public Renderer Compatibility

AI-generated designs must use the same renderer as manually created pages.

There should not be:

```text
Manual Renderer
AI Renderer
```

Instead:

```text
Manual Editor ──┐
                ├──> Shared Page Specification ──> Public Renderer
AI Builder ─────┘
```

This is a critical architectural requirement.

---

# Preset Architecture

The Custom Preset system should also use the same design specification.

```text
Manual Editor
     ↓
Design Specification
     ↓
Save Preset
```

and:

```text
AI Builder
     ↓
Design Specification
     ↓
Save Preset
```

Therefore all three systems share the same underlying representation:

```text
Manual Builder
AI Builder
Preset System
```

---

# Design Direction

The AI Builder should produce designs that feel:

* Modern
* Premium
* Creator-focused
* Mobile-first
* Visually coherent
* Conversion-aware
* Clean
* Fast
* Highly customizable

Avoid generating overly complex interfaces.

The public page should remain focused on the creator's content and CTAs.

---

# AI Design Intelligence

The AI should make reasonable design decisions based on context.

For example:

### Gaming Creator

Possible design:

* Dark background
* Strong accent
* High contrast
* Compact cards
* Social links
* Twitch / YouTube emphasis

### Photographer

Possible design:

* Large imagery
* Minimal typography
* Gallery emphasis
* Soft visual hierarchy
* Portfolio CTA

### Developer

Possible design:

* Editorial/technical typography
* GitHub emphasis
* Project links
* Documentation links
* Minimal layout

### Fashion Creator

Possible design:

* Editorial typography
* Large imagery
* Premium spacing
* Product sections
* Clean CTA hierarchy

### Affiliate Storefront

Possible design:

* Product-focused layout
* Clear category sections
* Strong product imagery
* Simple CTA buttons
* Mobile-friendly product browsing

These are examples, not hardcoded templates.

---

# Custom Preset Naming

When saving a preset, the user should be able to provide:

* Name
* Description
* Optional category

Example:

```text
Name:
Fitness Creator — Dark

Description:
Premium dark creator layout for fitness content.

Category:
Fitness
```

AI may suggest a name, but the user must be able to change it.

---

# Preset Preview

Every preset should have a visual preview.

The preview should be generated from the actual design specification rather than a manually uploaded screenshot whenever possible.

This ensures the preview remains accurate.

---

# Applying Presets Across LinkNest

Example:

```text
My Presets

Fitness Dark
├── Link in Bio
└── Storefront

Minimal Creator
└── Link in Bio

Product Grid
└── Storefront
```

The UI should clearly indicate compatibility.

---

# AI Builder and Existing Template Gallery

The existing Phase 3 Template Gallery should remain functional.

Phase 6 adds:

```text
Templates
├── LinkNest Templates
├── My Custom Presets
└── AI Generated
```

AI does NOT replace the existing template system.

It extends it.

---

# Important Separation

Do not mix these concepts:

### Template

A predefined LinkNest design.

### Custom Preset

A design saved by the user.

### AI Generated Design

A temporary AI-generated draft.

### AI Preset

An AI-generated design saved permanently by the user.

The lifecycle is:

```text
AI Generated Design
       ↓
Temporary Draft
       ↓
User Approves
       ↓
Optional Save as Custom Preset
```

---

# Analytics

AI Builder usage may be tracked separately from public page analytics.

Possible metrics:

* AI generations
* Successful generations
* Failed generations
* Regenerations
* Presets created
* Presets applied
* AI-generated pages published

Do not expose sensitive prompts or private reference information in public analytics.

---

# Security

The implementation must:

* Authenticate AI requests
* Authorize page access
* Validate generated structures
* Validate external URLs
* Sanitize generated text
* Prevent malicious HTML
* Prevent unsafe embeds
* Protect uploaded assets
* Apply rate limits
* Protect AI provider credentials
* Never expose API keys to the client

Existing LinkNest security rules must be followed.

---

# Development Order

Build Phase 6 in the following order.

## 1. Shared Design Specification

Create the normalized structure used by:

* Manual Builder
* AI Builder
* Preset System
* Public Renderer

This should be completed first.

---

## 2. Custom Preset Infrastructure

Implement:

* Preset database
* Create preset
* Update preset
* Delete preset
* Duplicate preset
* List presets
* Apply preset
* Compatibility validation

---

## 3. Manual Save as Preset

Add:

```text
Save as Custom Preset
```

to the existing Link in Bio and Storefront editors.

Verify that manually created designs can be saved and reused.

---

## 4. Custom Preset Gallery

Build:

* My Presets
* AI Presets
* Compatibility labels
* Preview cards
* Apply
* Edit
* Duplicate
* Delete

---

## 5. AI Provider Abstraction

Create the backend AI service abstraction.

The rest of LinkNest should not directly depend on a specific AI provider.

---

## 6. AI Structured Output

Implement validated structured generation.

The AI must return LinkNest-compatible design specifications.

Never directly execute arbitrary AI-generated code.

---

## 7. AI Builder UI

Implement:

* Prompt input
* Use case input
* URL references
* Image references
* Link input
* Asset input
* Generate button
* Loading states
* Preview
* Apply
* Discard
* Regenerate

---

## 8. Link in Bio AI Builder

Support generation of:

* Profile
* Social links
* Blocks
* Layout
* Theme
* Typography
* Background
* Buttons
* Cards

---

## 9. Storefront AI Builder

Support generation of:

* Storefront details
* Sections
* Products
* Product cards
* External URLs
* Layout
* Theme
* CTA configuration

---

## 10. AI Regeneration

Implement targeted commands such as:

* Restyle
* Reorder
* Add section
* Remove section
* Change theme
* Improve design
* Modify product cards
* Modify buttons

---

## 11. Reference Understanding

Add:

* URL analysis
* Image analysis
* Reference metadata
* Design extraction

Do this after the core AI Builder works with normal user prompts.

---

## 12. Async Processing

Integrate BullMQ/Redis where generation or reference analysis becomes long-running.

---

## 13. Versioning / Undo

Ensure AI operations can be reverted safely.

---

## 14. Testing

Test:

* AI generation
* Invalid AI output
* Preset creation
* Preset application
* Cross-builder compatibility
* URL validation
* Image references
* Existing page modification
* Rollback
* Permissions
* Rate limiting
* Error handling

---

## 15. Polish

Improve:

* Loading states
* Empty states
* Error messages
* Preview experience
* Mobile UX
* Accessibility
* Performance
* Visual consistency

---

# Completion Criteria

Phase 6 is complete when:

* Users can generate Link in Bio pages using AI.
* Users can generate Storefronts using AI.
* Users can describe their desired design naturally.
* Users can provide reference URLs.
* Users can provide reference images.
* Users can provide example links.
* AI can generate valid LinkNest design specifications.
* AI-generated pages use existing LinkNest components.
* AI-generated pages are fully editable manually.
* Users can regenerate specific parts of a page.
* AI-generated designs can be saved as Custom Presets.
* Manually created designs can be saved as Custom Presets.
* Custom Presets appear in the preset/template gallery.
* Presets can be reused.
* Presets have compatibility information.
* Shared visual presets can work across Link in Bio and Storefront.
* Presets can be duplicated and deleted.
* AI changes can be reverted.
* AI output is validated server-side.
* External URLs are validated.
* AI requests are authenticated and rate limited.
* No arbitrary AI-generated frontend code is executed.
* Existing Link in Bio functionality continues working.
* Existing Storefront functionality continues working.
* No major bugs remain.
* Documentation is updated.

---

# Out of Scope

The following should NOT be implemented as part of Phase 6 unless explicitly required later:

* Autonomous website deployment
* Autonomous code generation for the frontend
* AI-generated arbitrary React components
* AI-generated backend code
* AI-generated database migrations
* AI product purchasing
* AI checkout
* AI payment processing
* AI marketplace
* AI affiliate-network management
* Autonomous external account creation
* Autonomous social media posting
* Autonomous product ordering
* Full website cloning
* Copying protected third-party assets
* Fully autonomous publishing without user approval

---

# Final Architecture

The intended architecture is:

```text
                    ┌──────────────────┐
                    │   Manual Builder │
                    └────────┬─────────┘
                             │
                             ↓
                    ┌──────────────────┐
                    │ Design           │
                    │ Specification    │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              ↓              ↓              ↓
        ┌───────────┐  ┌────────────┐  ┌──────────────┐
        │ AI        │  │ Preset     │  │ Public       │
        │ Builder   │  │ System     │  │ Renderer     │
        └─────┬─────┘  └──────┬─────┘  └──────────────┘
              │               │
              ↓               ↓
        ┌────────────────────────────┐
        │ Link in Bio / Storefront  │
        └────────────────────────────┘
```

The most important architectural principle is:

**AI should generate the same structured design system that the manual builder uses.**

Do not build a separate AI-only page format.

This allows:

```text
Manual Design
      ↓
Save Preset

AI Design
      ↓
Save Preset

Preset
      ↓
Manual Editor
      ↓
Modify
      ↓
Publish
```

This makes LinkNest's AI Builder an extension of the existing product rather than a separate feature.
