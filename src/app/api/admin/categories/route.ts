import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { hasTrustedOrigin } from '@/lib/security';
const schema = z.object({ competitionId: z.string().min(1), name: z.string().min(2).max(100), description: z.string().max(1000).optional() });
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const items = await prisma.category.findMany({ include: { competition: { select: { name: true } }, _count: { select: { nominees: true } } }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(items);
}
export async function POST(req: NextRequest) {
  if (!hasTrustedOrigin(req)) return NextResponse.json({ error: 'Untrusted request origin' }, { status: 403 });
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid category details' }, { status: 400 });
  const { competitionId, name, description } = parsed.data;
  try {
    const category = await prisma.category.create({ data: { competitionId, name, slug: slugify(name), description } });
    return NextResponse.json(category, { status: 201 });
  } catch { return NextResponse.json({ error: 'Could not create category. Check competition and duplicate category name.' }, { status: 409 }); }
}
