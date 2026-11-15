import { NextRequest, NextResponse } from 'next/server';

// IMPORTANT: Do not credit votes from an unverified callback.
// Implement Safaricom's current callback validation and reconcile transaction status
// server-to-server before changing Payment.status or creating VoteLedger rows.
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { message: 'Callback endpoint scaffolded; provider verification is not configured.' },
    { status: 501 }
  );
}
