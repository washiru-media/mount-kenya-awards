# MOUNT KENYA AWARDS — Stage 5 deployment preparation

This project is still a development build. These steps prepare it for deployment; they do not register the domain, create hosting accounts, or launch the website.

## 1. Domain
Register `mountkenyaawards.co.ke` with an accredited `.ke` registrar. Registration is separate from this source package. After choosing a host, add the domain there and copy the exact DNS records supplied by that host. Do not guess A, AAAA, CNAME, or nameserver values. Enable HTTPS after DNS verification.

## 2. Hosting and database
Choose a Next.js-compatible host and a managed PostgreSQL database. Create a production database and use its TLS connection string as `DATABASE_URL`. Keep development and production databases separate.

## 3. Environment variables
Set every value in `.env.production.example` in the host's encrypted environment-variable settings. Generate `ADMIN_SESSION_SECRET` with a cryptographically secure random generator. Do not commit `.env`, share secrets in chat, or put secrets in frontend code.

## 4. Initial deployment procedure
1. Push the source to a private Git repository.
2. Connect that repository to a Next.js-compatible host.
3. Configure production environment variables.
4. Run `npx prisma generate`.
5. Apply reviewed migrations with `npx prisma migrate deploy`.
6. Run the one-time seed command only after confirming the production database is empty and the admin email/password are correct: `npm run db:seed`.
7. Deploy and verify `/api/health` returns HTTP 200 and `{"status":"ok","database":"connected"}`.
8. Sign in at `/admin/login`, create competitions/categories, and test public nomination review with test data.

## 5. Security controls included in Stage 5
- Administrator session lookup now confirms the account still exists and has `SUPER_ADMIN` role.
- Session cookie uses `HttpOnly`, `SameSite=Strict`, and `Secure` in production.
- Admin login and mutation endpoints require the request Origin to match the configured `APP_URL`.
- Basic browser security headers are configured.
- `/api/health` checks database connectivity without exposing credentials.

## 6. Required before production launch
- Run dependency audit, static checks, build, migration review, and end-to-end tests.
- Add distributed rate limiting (for example, Redis-backed), CAPTCHA/abuse controls on public nominations, MFA for the administrator, structured audit logs, error monitoring, backups and restore drills.
- Review privacy notice, data retention, consent, candidate photo permissions, terms, refund policy, consumer-protection, tax and Kenyan data-protection obligations with qualified professionals.
- Review all public forms and admin endpoints for validation, abuse, authorization and CSRF behavior.
- Complete Safaricom M-Pesa Business onboarding and Daraja production credentials before implementing and testing STK Push.
- Implement provider callback authentication/verification, transaction reconciliation, idempotency and atomic vote-ledger updates before taking any live payment.

## 7. Payment safety
The personal M-Pesa wallet does not itself provide the business shortcode and API credentials needed for automated STK Push. Checkout is intentionally unavailable and callbacks do not credit votes. Do not announce paid voting until the payment flow has passed sandbox and production verification.

## 8. Health check
Visit `https://mountkenyaawards.co.ke/api/health` only after the domain is connected and deployment is live. A 503 means the app cannot reach PostgreSQL; inspect hosting logs and the database connection string.
