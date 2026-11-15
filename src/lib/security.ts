import { NextRequest } from 'next/server';

/**
 * Require same-origin browser requests for cookie-authenticated mutations.
 * Configure APP_URL to the canonical HTTPS origin in production.
 */
export function hasTrustedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  const configured = process.env.APP_URL;
  if (!origin || !configured) return false;
  try {
    return new URL(origin).origin === new URL(configured).origin;
  } catch {
    return false;
  }
}
