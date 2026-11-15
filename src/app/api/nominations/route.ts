import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
const schema = z.object({
  categoryId: z.string().min(1), nomineeName: z.string().min(2).max(120),
  biography: z.string().max(3000).optional(), photoUrl: z.string().url().optional().or(z.literal('')),
  submitterName: z.string().min(2).max(120), submitterEmail: z.string().email().optional().or(z.literal('')),
  submitterPhone: z.string().max(30).optional(), consent: z.literal(true)
});
export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Please complete the required fields and confirm consent.' }, { status: 400 });
  const data = parsed.data;
  const category = await prisma.category.findUnique({ where: { id: data.categoryId }, include: { competition: true } });
  if (!category || category.competition.status !== 'OPEN') return NextResponse.json({ error: 'Nominations are not open for this category.' }, { status: 409 });
  const nomination = await prisma.nominationSubmission.create({ data: { ...data, photoUrl: data.photoUrl || null, submitterEmail: data.submitterEmail || null } });
  return NextResponse.json({ id: nomination.id, status: 'PENDING', message: 'Thank you. Your nomination has been submitted for administrator review.' }, { status: 201 });
}
