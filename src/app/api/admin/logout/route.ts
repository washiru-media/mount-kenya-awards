import { NextRequest, NextResponse } from 'next/server';
import { clearAdminSession } from '@/lib/auth';
import { hasTrustedOrigin } from '@/lib/security';
export async function POST(req: NextRequest) {
  if (!hasTrustedOrigin(req)) return NextResponse.json({ error: 'Untrusted request origin' }, { status: 403 });
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}
