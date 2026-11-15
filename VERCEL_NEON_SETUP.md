# Vercel + Neon setup for MOUNT KENYA AWARDS

## Recommended deployment topology
- Vercel: Next.js hosting and deployments.
- Neon: managed PostgreSQL.
- GitHub: private source repository and automatic deployments.
- Custom domain: `mountkenyaawards.co.ke`, connected after the preview deployment works.

## A. Create the private Git repository
1. Sign in to GitHub and create a **private** repository named `mount-kenya-awards`.
2. Upload/extract the contents of this project folder so `package.json`, `prisma/`, and `src/` are at the repository root. Do not upload `.env` files containing real secrets.
3. Confirm the repository's default branch is `main`.

## B. Import into Vercel
1. Sign in to Vercel.
2. Select **Add New → Project**.
3. Import the private `mount-kenya-awards` GitHub repository.
4. Confirm Framework Preset is **Next.js** and Root Directory is `./`.
5. Build command should use the package script `npm run build`; Install command `npm install`.
6. Deploy a Preview first. Do not connect the production domain yet.

Vercel Git deployments create Preview deployments for branches and Production deployments from the production branch. See Vercel's official Git deployment guide.

## C. Provision Neon PostgreSQL
1. In Vercel Marketplace, open Storage / Marketplace and select Neon Postgres, or create a project directly in Neon Console.
2. Create a project named `mount-kenya-awards`.
3. Choose a region close to your expected users and Vercel deployment region where possible.
4. Create a database and a dedicated database role for the application.
5. Copy both connection strings:
   - pooled connection string for `DATABASE_URL` (application runtime);
   - direct, non-pooled connection string for `DIRECT_URL` (Prisma migrations).
6. Do not paste either string into chat, GitHub, screenshots, or source files.

For Prisma 6, this repository uses `DATABASE_URL` for the runtime URL and `DIRECT_URL` for migration/admin connections. Neon documents pooled URLs for application connections and direct URLs for migrations.

## D. Configure Vercel environment variables
In Vercel → Project → Settings → Environment Variables, add:
- `DATABASE_URL` = Neon pooled connection string
- `DIRECT_URL` = Neon direct connection string
- `APP_URL` = `https://mountkenyaawards.co.ke`
- `ADMIN_EMAIL` = your private administrator email
- `ADMIN_INITIAL_PASSWORD` = a unique password of at least 16 characters
- `ADMIN_SESSION_SECRET` = a cryptographically random secret of at least 32 characters

Set these for **Preview** and **Production** separately. For Preview, use a separate Neon branch/database and a different admin password/secret. Keep payment credentials blank; payment integration is not ready.

## E. Apply the database migration
After the first Vercel preview is linked and the environment variables are saved:
1. Run `npx prisma migrate deploy` against the production database from a trusted local terminal with the production variables loaded, or use a protected deployment job.
2. Run `npm run db:seed` exactly once against the intended fresh production database to create the super administrator and initial draft competition.
3. Do not repeatedly seed production with a changed password unless you intentionally want to rotate the admin password.
4. Redeploy if the deployment was built before the environment variables were configured.

This source package now includes an initial PostgreSQL migration. Review it before applying to any database containing data.

## F. Verify preview
- Visit the Vercel preview URL.
- Visit `/api/health`; expected response is HTTP 200 with database connected.
- Visit `/admin/login`; sign in with the admin credentials you configured.
- Create a draft competition and categories.
- Verify public pages and nomination moderation using test records.
- Confirm no public payment checkout is available.

## G. Connect the domain only after preview tests
In Vercel Project → Settings → Domains, add:
- `mountkenyaawards.co.ke`
- `www.mountkenyaawards.co.ke` (optional; redirect one to the canonical domain)

Vercel will display the exact DNS records required. Enter those exact records at the `.ke` registrar where the domain is registered. DNS values vary; do not copy generic records from tutorials. Wait for Vercel to verify the domain and issue HTTPS.

## H. Production launch gate
Do not open public paid voting until:
- administrator MFA, rate limiting and monitoring are in place;
- backups and restore test are completed;
- privacy, consent, terms and refund policy are reviewed;
- Safaricom M-Pesa Business shortcode and Daraja production access are obtained;
- STK Push, callback reconciliation, duplicate protection and atomic vote ledger are implemented and tested end-to-end.

## Official guides
- Vercel Git deployment: https://vercel.com/docs/git
- Vercel Next.js: https://vercel.com/docs/frameworks/full-stack/nextjs
- Neon connection strings: https://neon.com/docs/connect/connect-from-any-app
- Prisma + Neon (Prisma 6): https://www.prisma.io/docs/orm/v6/overview/databases/neon
