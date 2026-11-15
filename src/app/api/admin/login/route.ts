import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createAdminSession } from '@/lib/auth';
import { hasTrustedOrigin } from '@/lib/security';

const schema = z.object({ email: z.string().email(), password: z.string().min(12).max(200) });
export async function POST(req: NextRequest) {
  if (!hasTrustedOrigin(req)) return NextResponse.json({ error: 'Untrusted request origin' }, { status: 403 });
  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: 'Invalid login details' }, { status: 400 });
  const admin = await prisma.admin.findUnique({ where: { email: body.data.email.toLowerCase() } });
  if (!admin || admin.role !== 'SUPER_ADMIN' || !(await bcrypt.compare(body.data.password, admin.passwordHash))) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }
  await createAdminSession(admin.id);
  return NextResponse.json({ ok: true });
}
