import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';
export default async function NomineePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const nominee = await prisma.nominee.findFirst({ where: { id, status: 'APPROVED', category: { competition: { status: { in: ['OPEN','CLOSED'] } } } }, include: { category: { include: { competition: true } } } });
  if (!nominee) notFound();
  return <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
    <Link href={`/categories/${nominee.category.competition.slug}/${nominee.category.slug}`} className="text-sm text-amber-200">← Back to {nominee.category.name}</Link>
    <article className="mt-8 grid overflow-hidden rounded-3xl border border-amber-200/20 bg-stone-950 md:grid-cols-2">
      <div className="min-h-80 bg-gradient-to-br from-stone-800 to-amber-950">{nominee.photoUrl ? <img src={nominee.photoUrl} alt={nominee.fullName} className="h-full min-h-80 w-full object-cover" /> : <div className="flex h-full min-h-80 items-center justify-center text-8xl">🏆</div>}</div>
      <div className="p-8 md:p-10"><p className="text-xs font-bold tracking-[.25em] text-amber-200">{nominee.category.competition.name}</p><p className="mt-2 text-sm text-stone-400">{nominee.category.name}</p><h1 className="mt-5 text-4xl font-black">{nominee.fullName}</h1><p className="mt-6 whitespace-pre-wrap leading-7 text-stone-300">{nominee.biography || 'Nominee profile details will be updated soon.'}</p><div className="mt-8 rounded-2xl border border-amber-200/20 p-5"><p className="text-xs text-stone-400">CURRENT VOTE TOTAL</p><p className="mt-2 text-3xl font-black gold-text">{nominee.votes.toLocaleString()}</p><p className="mt-1 text-xs text-stone-500">Votes are displayed from the platform ledger.</p></div><button disabled className="mt-6 w-full cursor-not-allowed rounded-full bg-amber-300/40 px-6 py-3 font-bold text-stone-950">Voting opening soon</button><p className="mt-3 text-xs text-stone-500">Online payment voting is not yet activated. No payment will be requested on this preview.</p></div>
    </article>
  </main>;
}
