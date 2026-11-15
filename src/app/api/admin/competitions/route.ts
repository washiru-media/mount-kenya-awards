import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { hasTrustedOrigin } from '@/lib/security';

const createSchema = z.object({
  name: z.string().min(3).max(120),
  description: z.string().max(2000).optional(),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
});
const updateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['DRAFT', 'OPEN', 'CLOSED', 'ARCHIVED']).optional(),
  name: z.string().min(3).max(120).optional(),
  description: z.string().max(2000).optional().nullable(),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
});
const slugify = (value: string) => value.toLowerCase().trim()
  .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const items = await prisma.competition.findMany({
    include: { _count: { select: { categories: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(items);
}
export async function POST(req: NextRequest) {
  if (!hasTrustedOrigin(req)) return NextResponse.json({ error: 'Untrusted request origin' }, { status: 403 });
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Enter a competition name and valid dates.' }, { status: 400 });
  const { name, description, startsAt, endsAt } = parsed.data;
  if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt))
    return NextResponse.json({ error: 'End date must be after start date.' }, { status: 400 });
  const base = slugify(name) || 'competition';
  let slug = base;
  for (let i = 2; await prisma.competition.findUnique({ where: { slug } }); i++) slug = `${base}-${i}`;
  const item = await prisma.competition.create({
    data: { name, slug, description, startsAt: startsAt ? new Date(startsAt) : null, endsAt: endsAt ? new Date(endsAt) : null },
  });
  return NextResponse.json(item, { status: 201 });
}
export async function PATCH(req: NextRequest) {
  if (!hasTrustedOrigin(req)) return NextResponse.json({ error: 'Untrusted request origin' }, { status: 403 });
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid competition update.' }, { status: 400 });
  const { id, startsAt, endsAt, ...rest } = parsed.data;
  const current = await prisma.competition.findUnique({ where: { id } });
  if (!current) return NextResponse.json({ error: 'Competition not found.' }, { status: 404 });
  const start = startsAt === undefined ? current.startsAt : startsAt ? new Date(startsAt) : null;
  const end = endsAt === undefined ? current.endsAt : endsAt ? new Date(endsAt) : null;
  if (start && end && end <= start) return NextResponse.json({ error: 'End date must be after start date.' }, { status: 400 });
  if (rest.status === 'OPEN' && current.status === 'ARCHIVED')
    return NextResponse.json({ error: 'Archived competitions cannot be reopened. Create a new competition instead.' }, { status: 409 });
  const updated = await prisma.competition.update({
    where: { id },
    data: { ...rest, ...(startsAt !== undefined ? { startsAt: start } : {}), ...(endsAt !== undefined ? { endsAt: end } : {}) },
  });
  return NextResponse.json(updated);
}
