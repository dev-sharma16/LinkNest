# LinkNest

The all-in-one creator platform for smart links, bio pages, analytics, digital products, marketing tools, and AI.

This repository contains the **LinkNest application** (currently **Phase 1 — Smart Links MVP**). Product requirements live in [`docs/`](./docs).

## Tech stack

| Category | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui (Base UI) |
| Database | PostgreSQL (Neon preferred) |
| ORM | Prisma 7 (driver adapter: `@prisma/adapter-pg`) |
| Auth | Better Auth (email + password) |
| Validation | Zod |
| Forms | React Hook Form |
| Server State | TanStack Query |
| Tables / Charts | TanStack Table / Recharts |
| Other | Zustand (optional), `qrcode`, Resend (email) |

## Getting started

1. Install dependencies

   ```bash
   npm install
   ```

2. Configure environment variables (copy from `.env`)

   ```bash
   # .env
   DATABASE_URL="postgresql://user:password@host/db?schema=public"
   BETTER_AUTH_SECRET="a-random-secret"
   BETTER_AUTH_URL="http://localhost:3000"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

3. Create the database schema

   ```bash
   npm run db:push        # or: npm run db:migrate
   ```

4. Run the dev server

   ```bash
   npm run dev
   ```

Open http://localhost:3000.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:migrate` | Create/apply Prisma migrations |
| `npm run db:push` | Push the schema without migrations |
| `npm run db:studio` | Open Prisma Studio |

## Project structure

```
src/
├── app/
│   ├── (auth)/            # Sign in / sign up / password reset
│   ├── (dashboard)/       # Protected dashboard (links, analytics, settings)
│   ├── api/               # Route Handlers (auth, links, analytics, ...)
│   ├── [slug]/route.ts    # Redirect engine
│   ├── unlock/[slug]      # Password-protected link gate
│   └── not-found.tsx      # Custom 404
├── components/            # Reusable UI and feature components
├── hooks/                 # TanStack Query hooks
├── lib/                   # Prisma, auth, validation, utils
└── server/                # Server-only business logic
```

## Phase 1 features

- Authentication (sign up, sign in, email verification, password reset)
- Link management (create, edit, delete, folders, tags, favorites, archive, search, pagination, bulk actions)
- Redirect engine (custom slugs, password protection, expiration, scheduling, deep links, UTM params)
- Analytics (clicks, unique visitors, country, city, device, browser, OS, referrer, timeline)
- Dashboard (overview widgets and charts)
- QR codes (generation, download, color/size customization)
- Custom domains (management)
- UTM templates

## Documentation

See [`docs/`](./docs) — the single source of truth for vision, tech stack, project rules, database design, and feature phases.
