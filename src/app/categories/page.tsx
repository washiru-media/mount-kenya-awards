import Link from 'next/link';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';
export default async function CategoriesPage() {
  const competitions = await prisma.competition.findMany({
    where: { status: { in: ['OPEN', 'CLOSED'] } },
    include: { categories: { include: { _count: { select: { nominees: true } } }, orderBy: { name: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });
  return <main className="mx-auto min-h-screen max-w-7xl px-6 py-10">
    <header className="flex items-center justify-between gap-4"><Link href="/" className="text-lg font-black tracking-widest gold-text">MOUNT KENYA AWARDS</Link><Link href="/nominate" className="text-sm text-amber-200">Submit a nomination →</Link></header>
    <section className="py-16"><p className="text-xs font-bold tracking-[.3em] text-amber-200">THE AWARDS</p><h1 className="mt-3 text-4xl font-black md:text-5xl">Explore categories</h1><p className="mt-4 max-w-2xl text-stone-400">Discover the award categories and meet the people making a difference across the Mount Kenya region.</p></section>
    {competitions.length === 0 ? <div className="rounded-2xl border border-white/10 bg-stone-950 p-8 text-center"><p className="text-xl font-bold">Awards are being prepared</p><p className="mt-2 text-sm text-stone-400">Published competitions and categories will appear here.</p></div> :
      competitions.map(comp => <section key={comp.id} className="mb-12"><div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-bold gold-text">{comp.name}</h2>{comp.description && <p className="mt-2 text-sm text-stone-400">{comp.description}</p>}</div><span className="rounded-full border border-amber-200/30 px-3 py-1 text-xs text-amber-100">{comp.status}</span></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{comp.categories.map((cat, i) => <Link key={cat.id} href={`/categories/${comp.slug}/${cat.slug}`} className="group rounded-2xl border border-amber-200/20 bg-stone-950 p-6 transition hover:-translate-y-1 hover:border-amber-200/60"><div className="flex items-center justify-between"><span className="text-3xl">🏆</span><span className="text-xs text-stone-500">{String(i+1).padStart(2,'0')}</span></div><h3 className="mt-6 text-xl font-bold group-hover:text-amber-200">{cat.name}</h3><p className="mt-2 text-sm text-stone-400">{cat._count.nominees} published nominees</p><p className="mt-6 text-sm font-bold text-amber-200">View nominees →</p></Link>)}</div>
      </section>)}
    <footer className="border-t border-white/10 py-8 text-xs text-stone-500">© {new Date().getFullYear()} MOUNT KENYA AWARDS</footer>
  </main>;
}
