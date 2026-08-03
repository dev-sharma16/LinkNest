# LinkNest Tech Stack (v1)

> This document defines the official technology stack for LinkNest.
>
> Every feature, implementation, architecture decision, and code generation must follow this document.
>
> The technologies listed here are fixed unless this document is intentionally updated.
>
> Do NOT replace technologies with alternatives.
>
> If a feature requires something not listed here, suggest it first instead of automatically introducing a new dependency.

---

# Core Principles

- Single Next.js application.
- TypeScript everywhere.
- Keep dependencies minimal.
- Prefer official libraries.
- Build scalable architecture.
- Follow modern best practices.
- Avoid unnecessary abstractions.
- Production-ready code only.

---

# Frontend

## Framework

**Next.js (App Router)**

Status: ✅ Official

Reason:

- Server Components
- Client Components
- Server Actions
- Route Handlers
- Middleware
- Streaming
- SEO
- Metadata API
- Optimized routing
- Excellent TypeScript support
- Excellent Vercel support

All frontend and backend code should live inside the Next.js application.

Do NOT create a separate Express backend.

---

## Language

TypeScript

Status: ✅ Required

Rules

- Strict mode enabled.
- No JavaScript files.
- Strong typing.
- Avoid using `any`.
- Prefer inferred types where appropriate.

---

## Styling

### Tailwind CSS

Status: ✅ Official

Used for:

- Layout
- Responsive Design
- Utilities
- Themes

---

### shadcn/ui

Status: ✅ Official

Used for:

- Buttons
- Forms
- Dialogs
- Tables
- Cards
- Navigation
- Dashboard Components

Do not introduce another component library.

---

# Backend

Backend is built entirely using Next.js.

Use:

- Route Handlers
- Server Actions
- Middleware

Do NOT use:

- Express
- NestJS
- Fastify
- Hono

Everything should remain inside the Next.js application.

---

# Database

## PostgreSQL

Status: ✅ Official

Supported Providers

- Neon
- Supabase
- Railway
- Managed PostgreSQL

Preferred provider:

Neon

Reason:

Future features require relational data.

Examples:

- Users
- Links
- Analytics
- Products
- Teams
- Organizations
- AI history
- Campaigns

---

# ORM

## Prisma

Status: ✅ Official

Why

- Excellent TypeScript support
- Excellent migrations
- Strong relations
- Large ecosystem
- Great developer experience

Do not use:

- Drizzle ORM
- TypeORM
- Sequelize

---

# Authentication

## Better Auth

Status: ✅ Official

Authentication methods

- Email & Password
- Google OAuth (Future)
- GitHub OAuth (Future)
- Magic Links (Future)

Features

- Sessions
- Protected Routes
- Account Management

Do not replace Better Auth.

---

# Image Storage

Official Providers

- ImageKit (Preferred)
- Cloudinary (Alternative)

Preferred choice:

ImageKit

Used for

- User Avatars
- Product Images
- Creator Images
- QR Codes
- Media Assets

Never store uploaded files on the application server.

---

# Validation

## Zod

Status: ✅ Official

Use Zod for

- API Validation
- Form Validation
- Environment Variables
- Server Actions
- Request Validation
- Response Validation

Every input should be validated.

---

# Forms

## React Hook Form

Status: ✅ Official

Combined with

- Zod

Used for

- Authentication
- Dashboard Forms
- Settings
- Product Forms
- Creator Forms

---

# Data Fetching

## TanStack Query

Status: ✅ Official

Used for

- API Calls
- Server State
- Caching
- Mutations

---

# Client State

## Zustand

Status: Optional

Use only when global client state becomes necessary.

Examples

- Theme
- Sidebar
- Preferences
- Temporary UI State

Do not introduce Redux unless explicitly approved.

---

# Tables

## TanStack Table

Status: ✅ Official

Used for

- Links
- Analytics
- Products
- Campaigns
- Team Members

---

# Charts

## Recharts

Status: ✅ Official

Used for

- Analytics
- Dashboard
- Reports

---

# File Uploads

Upload Strategy

Direct uploads to

- ImageKit
- Cloudinary

Avoid storing uploads on the server.

UploadThing may be introduced later if needed.

---

# Emails

Official Provider

Resend

Used for

- Verification
- Password Reset
- Notifications
- Team Invitations

Email functionality is introduced only when required.

---

# Background Jobs

Not required initially.

Future use cases

- Analytics Aggregation
- Email Sending
- Scheduled Links
- Expired Links
- AI Processing

A queue system will be selected only when required.

Do not introduce BullMQ, Inngest, Trigger.dev, or similar unless approved.

---

# Caching

Future Technology

Redis

Used for

- Redirect Performance
- Rate Limiting
- Frequently Accessed Data
- Analytics Cache

Redis should only be introduced when scaling requires it.

---

# Search

Initial Strategy

PostgreSQL Full Text Search

Dedicated search engines will only be considered if scale requires them.

---

# Monitoring

Future additions

- Error Tracking
- Logging
- Performance Monitoring

Monitoring tools will be selected later.

Do not add Sentry, LogRocket, or similar without approval.

---

# Payments

Future Provider

Stripe

Used for

- Creator Subscriptions
- Platform Billing
- Premium Plans

Payments are outside Phase 1.

---

# AI

Future Providers

- OpenAI
- Google Gemini

Potential use cases

- Landing Page Generation
- Product Descriptions
- AI Recommendations
- Content Generation
- Analytics Insights

AI features are outside Phase 1.

---

# Deployment

Official Deployment

Application

- Vercel

Database

- Neon PostgreSQL

Storage

- ImageKit

Alternative Storage

- Cloudinary

---

# Development Rules

Every implementation must follow this stack.

Do NOT

- Replace libraries with alternatives.
- Introduce new frameworks.
- Add unnecessary dependencies.
- Build separate backend services.
- Store files locally.
- Use JavaScript instead of TypeScript.

If a new dependency is genuinely required:

1. Explain why.
2. Compare alternatives.
3. Wait for approval before adding it.

---

# Technology Summary

| Category | Official Technology |
|-----------|---------------------|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Database | PostgreSQL (Neon Preferred) |
| ORM | Prisma |
| Authentication | Better Auth |
| Validation | Zod |
| Forms | React Hook Form |
| Server State | TanStack Query |
| Client State | Zustand (When Needed) |
| Tables | TanStack Table |
| Charts | Recharts |
| Image Storage | ImageKit |
| Alternative Storage | Cloudinary |
| Emails | Resend |
| Search | PostgreSQL Full Text Search |
| Caching | Redis (Future) |
| Payments | Stripe (Future) |
| AI | OpenAI / Gemini (Future) |
| Deployment | Vercel |

---

# Final Rule

This document is the single source of truth for LinkNest's technology stack.

Any AI agent or developer working on this project must follow this stack exactly.

Do not substitute technologies, change architectural decisions, or introduce additional libraries unless this document is explicitly updated by the project owner.