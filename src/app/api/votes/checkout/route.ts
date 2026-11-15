import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { VOTE_PACKAGES, amountForVotes } from '@/lib/voting';

const schema = z.object({
  nomineeId: z.string().min(1),
  votes: z.number().int(),
  phoneNumber: z.string().regex(/^254[17]\d{8}$/),
});

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid checkout details' }, { status: 400 });
  const { nomineeId, votes, phoneNumber } = parsed.data;
  if (!VOTE_PACKAGES.includes(votes as (typeof VOTE_PACKAGES)[number])) {
    return NextResponse.json({ error: 'Unsupported voting package' }, { status: 400 });
  }
  const amount = amountForVotes(votes);
  // TODO: verify nominee is approved and category is open in database.
  // TODO: create PENDING Payment row, then call Daraja STK Push server-side.
  // TODO: return checkout reference only; never accept a client-side vote increment.
  return NextResponse.json({ status: 'NOT_CONFIGURED', nomineeId, votes, phoneNumber, amount, message: 'Daraja credentials and database are required before payments can be initiated.' }, { status: 503 });
}
