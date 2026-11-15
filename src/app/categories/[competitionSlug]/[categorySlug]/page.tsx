import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';
export default async function CategoryPage({ params }: { params: Promise<{ competitionSlug: string; categorySlug: string }> }) {
  const { competitionSlug, categorySlug } = await params;
  const category = await prisma.category.findFirst({
    where: { slug: categorySlug, competition: { slug: competitionSlug, status: { in: ['OPEN','CLOSED'] } } },
    include: { competition: true, nominees: { where: { status: 'APPROVED' }, orderBy: [{ votes: 'desc' }, { fullName: 'asc' }] } },
  });
  if (!category) notFound();
  return <main className="mx-auto min-h-screen max-w-7xl px-6 py-10">
    <Link href="/categories" className="text-sm text-amber-200">← All categories</Link>
    <section className="py-14"><p className="text-xs tracking-[.3em] text-amber-200">{category.competition.name}</p><h1 className="mt-3 text-4xl font-black md:text-5xl">{category.name}</h1>{category.description && <p className="mt-4 max-w-2xl text-stone-400">{category.description}</p>}<p className="mt-4 text-sm text-stone-500">{category.nominees.length} approved nominees · Voting status: {category.competition.status}</p></section>
    {category.nominees.length === 0 ? <div className="rounded-2xl border border-white/10 bg-stone-950 p-8 text-center text-stone-400">Nominees will appear here once they are approved.</div> :
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{category.nominees.map((n, i) => <article key={n.id} className="overflow-hidden rounded-2xl border border-amber-200/20 bg-stone-950">
        {n.photoUrl ? <img src={n.photoUrl} alt={n.fullName} className="h-64 w-full object-cover" /> : <div className="flex h-64 items-center justify-center bg-gradient-to-br from-stone-800 to-amber-950 text-6xl">🏆</div>}
        <div className="p-5"><p className="text-xs tracking-widest text-amber-200">NOMINEE {String(i+1).padStart(2,'0')}</p><h2 className="mt-2 text-xl font-bold">{n.fullName}</h2><p className="mt-2 line-clamp-3 min-h-12 text-sm text-stone-400">{n.biography || 'Recognised for contribution and impact in the community.'}</p><div className="mt-5 flex items-center justify-between"><span className="text-sm text-stone-400">{n.votes.toLocaleString()} votes</span><Link href={`/nominees/${n.id}`} className="text-sm font-bold text-amber-200">View profile →</Link></div></div>
      </article>)}</div>}
  </main>;
}
