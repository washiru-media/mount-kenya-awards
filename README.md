# MOUNT KENYA AWARDS

Premium multi-category awards and paid-voting platform development project.

## Current build: Stage 3
Stage 3 adds a protected administrator console for:
- Creating competitions and changing their status (Draft, Open, Closed, Archived).
- Creating categories under competitions.
- Adding nominees directly as approved candidates.
- Reviewing public nominations and approving or rejecting them.
- Viewing the nominee register and key platform totals.

Only the seeded administrator account should be created. The admin session is signed and stored in an HTTP-only cookie.

## M-Pesa account requirement
A personal M-Pesa wallet alone does not provide the business shortcode and Daraja credentials required for a production STK Push checkout. Before live payments, arrange an eligible Safaricom M-Pesa Business service (such as PayBill or Till) and Daraja production access. Do not put credentials in source code or send them in chat.

The checkout endpoint remains intentionally unavailable and the callback endpoint does not credit votes. This prevents unverified or replayed payment notifications from creating votes.

## Stack
- Next.js App Router + TypeScript
- Tailwind CSS
- PostgreSQL + Prisma
- Safaricom Daraja integration planned, not yet live

## Setup
```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Set `ADMIN_EMAIL`, `ADMIN_INITIAL_PASSWORD` (at least 16 characters), `ADMIN_SESSION_SECRET` (at least 32 characters), and `DATABASE_URL` in `.env`. Keep `.env` private and never commit it.

## Operational cautions
- Public nomination intake accepts only nominations for categories belonging to OPEN competitions.
- Opening a competition allows public nomination intake; do not open it until categories and rules are ready.
- Admin nominee photo entry currently accepts an externally hosted image URL, not an uploaded file.
- Add CSRF protection, rate limiting, MFA, secure image storage, audit logging, automated tests, backups, monitoring, privacy notice, terms, refund policy, and a professional security review before production.
- Review Kenyan data-protection, consumer-protection, tax, and payment-provider requirements with qualified advisers.

## Voting integrity
- KSh 1 = 1 vote.
- Packages: 10, 50, 100, 200, 500, 1,000 votes.
- The server must calculate payment amount from the selected package.
- Only a verified successful provider callback may credit votes.
- Vote ledger entries and unique payment references are required for idempotency.
- Never credit votes based on a browser redirect or client-side success message.

This is a development build, not a deployed or production-ready service.


## Stage 4: public awards experience
Added database-driven public pages:
- Home page reads published competitions and categories from PostgreSQL.
- `/categories` lists published competitions and categories.
- `/categories/[competitionSlug]/[categorySlug]` displays approved nominees.
- `/nominees/[id]` displays a nominee profile and recorded vote total.
- `/leaderboard` displays top nominees per category.

Vote buttons remain disabled until secure M-Pesa Business checkout and callback verification are implemented. The leaderboard reflects recorded database totals; it is not a live push feed yet and refreshes on page load.


## Stage 5.1: Vercel + Neon deployment preparation
- Added Prisma `directUrl` support: pooled `DATABASE_URL` for app runtime and direct `DIRECT_URL` for migrations.
- Added an initial PostgreSQL migration under `prisma/migrations/`.
- Build script now runs `prisma generate && next build`; postinstall generates Prisma Client.
- Added `VERCEL_NEON_SETUP.md` with account setup, environment variables, migration, seed, preview and domain connection instructions.
- No accounts have been connected and no deployment has been performed from this chat.
Deployment trigger check