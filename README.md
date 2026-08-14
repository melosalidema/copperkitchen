# Copper Kitchen — Bicester

Production-ready monorepo for the Copper Kitchen (75 Sheep Street, Bicester, Oxfordshire OX26 6JS) website, booking API and shared packages.

> **Important status notice:** Copper Kitchen **ceased trading under that name on 26 October 2025** and now operates as **[Boca Tapas Bar and Grill](https://www.bocabicester.com/)**. The site carries a prominent status/transition banner. No Copper Kitchen email address is verified, so none is published; booking forms are disabled via the `reservations_enabled` setting.

## Stack

| Piece           | Tech                                                                 |
| --------------- | -------------------------------------------------------------------- |
| `apps/web`      | Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS        |
| `apps/api`      | Node.js 20 + Express 4 + TypeScript + Prisma ORM                      |
| `packages/shared` | Zod validation schemas + shared types/constants                     |
| `prisma/`       | Prisma schema + seed script (verified content only)                   |
| Database        | PostgreSQL 15 (Docker Compose)                                        |

## Repository layout

```
copperkitchen/
├── apps/
│   ├── api/        # Express API (public + admin routes)
│   └── web/        # Next.js 14 placeholder site
├── packages/
│   └── shared/     # Zod schemas, design tokens, constants
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── docker-compose.yml
├── package.json    # npm workspaces
└── tsconfig.base.json
```

## Prerequisites

- Node.js **20+** (Node 22 LTS recommended)
- npm **9+**
- Docker + Docker Compose (for local PostgreSQL)
- A `.env` file (copy `.env.example` and fill in real values)

## Setup (local development)

```bash
# 1. Install dependencies (npm workspaces)
npm install

# 2. Create environment file
copy .env.example .env        # Windows
cp .env.example .env          # macOS / Linux

# 3. Start PostgreSQL 15
npm run db:up

# 4. Generate Prisma client + create/migrate the schema
npm run prisma:generate
npm run prisma:migrate

# 5. Seed verified content (admin user, settings, menu, testimonials, hours)
npm run db:seed
```

## Development

```bash
npm run dev:api     # Express API on http://localhost:4000 (hot reload)
npm run dev:web     # Next.js on http://localhost:3000
```

## Build & typecheck

```bash
npm run typecheck   # shared + api typecheck (tsc --noEmit)
npm run build       # builds API (tsc) and web (next build)
```

## API overview

Public (no auth):

- `GET /health`
- `GET /api/settings`
- `GET /api/opening-hours`
- `GET /api/menu`
- `GET /api/testimonials`
- `GET /api/gallery`
- `GET /api/reservations/availability?date=&guests=` (403 while disabled)
- `POST /api/reservations` (403 while disabled)
- `PATCH /api/reservations/:id` (customer cancellation with `cancellationToken`)
- `POST /api/contact`
- `POST /api/newsletter`

Admin (JWT Bearer token):

- `POST /api/admin/auth/login`
- `GET /api/admin/reservations`
- `PATCH /api/admin/reservations/:id`
- `DELETE /api/admin/reservations/:id`
- CRUD `/api/admin/menu/categories` and `/api/admin/menu/items`
- CRUD `/api/admin/gallery`
- CRUD `/api/admin/testimonials`
- `GET` / `PUT /api/admin/opening-hours`
- `GET` / `PUT /api/admin/settings`
- `GET /api/admin/contact-messages`
- `GET /api/admin/newsletter-subscribers`

## Deployment notes

- **API**: build with `npm run build --workspace @copperkitchen/api`, then run `node dist/index.js` with a process manager (systemd, PM2) or a container. Set `NODE_ENV=production`, a real `JWT_SECRET`, real SMTP credentials and the production `FRONTEND_URL`.
- **Web**: build with `npm run build --workspace @copperkitchen/web` and deploy the `.next` output to any Node host or a serverless/edge platform. Set `NEXT_PUBLIC_API_URL` to the public API origin at build time.
- **Database**: PostgreSQL 15. Run `npx prisma migrate deploy --schema prisma/schema.prisma` on deploy and `npm run db:seed` once for the initial dataset.
- **SMTP**: outbound email is best-effort by design. If SMTP is unavailable the API logs a warning and continues (email functions are non-fatal).
- **reCAPTCHA**: populate `RECAPTCHA_SECRET` and wire the frontend to verify tokens on public POST endpoints (contact/newsletter/reservations) before going live.

## Content integrity

The seed script inserts **only verified content**: the transition notice, real contact details (01869 240877 / +441869240877, 75 Sheep Street), the Boca Tapas Bar and Grill URL, and Tripadvisor-sourced testimonials. No prices, no unverified email addresses, no unverified images, and no invented reviews.
