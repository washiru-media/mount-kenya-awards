import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { hasTrustedOrigin } from '@/lib/security';
const schema = z.object({ nominationId: z.string().min(1), decision: z.enum(['APPROVED','REJECTED']) });
export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const nominations = await prisma.nominationSubmission.findMany({ where: { status: 'PENDING' }, orderBy: { createdAt: 'asc' } });
  return NextResponse.json(nominations);
}
export async function PATCH(req: NextRequest) {
  if (!hasTrustedOrigin(req)) return NextResponse.json({ error: 'Untrusted request origin' }, { status: 403 });
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid review request' }, { status: 400 });
  const n = await prisma.nominationSubmission.findUnique({ where: { id: parsed.data.nominationId } });
  if (!n || n.status !== 'PENDING') return NextResponse.json({ error: 'Nomination not found or already reviewed' }, { status: 404 });
  if (parsed.data.decision === 'REJECTED') {
    await prisma.nominationSubmission.update({ where: { id: n.id }, data: { status: 'REJECTED' } });
    return NextResponse.json({ ok: true, decision: 'REJECTED' });
  }
  const slug = n.nomineeName.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') + '-' + n.id.slice(-5);
  await prisma.$transaction(async tx => {
    await tx.nominee.create({ data: { categoryId: n.categoryId, fullName: n.nomineeName, slug, biography: n.biography, photoUrl: n.photoUrl, status: 'APPROVED' } });
    await tx.nominationSubmission.update({ where: { id: n.id }, data: { status: 'APPROVED' } });
  });
  return NextResponse.json({ ok: true, decision: 'APPROVED' });
}
