import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { hasTrustedOrigin } from '@/lib/security';

const schema = z.object({
  categoryId: z.string().min(1),
  fullName: z.string().min(2).max(120),
  biography: z.string().max(2000).optional(),
  photoUrl: z.string().url().max(1000).optional().or(z.literal('')),
});
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const items = await prisma.nominee.findMany({
    include: { category: { select: { name: true, competition: { select: { name: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(items);
}
export async function POST(req: NextRequest) {
  if (!hasTrustedOrigin(req)) return NextResponse.json({ error: 'Untrusted request origin' }, { status: 403 });
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Check nominee details and photo URL.' }, { status: 400 });
  const { categoryId, fullName, biography, photoUrl } = parsed.data;
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
  const base = slugify(fullName) || 'nominee';
  const slug = `${base}-${Date.now().toString(36)}`;
  const nominee = await prisma.nominee.create({
    data: { categoryId, fullName, slug, biography, photoUrl: photoUrl || null, status: 'APPROVED' },
  });
  return NextResponse.json(nominee, { status: 201 });
}
