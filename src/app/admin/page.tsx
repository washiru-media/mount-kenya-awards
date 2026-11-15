import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminConsole from './admin-console';
export const dynamic = 'force-dynamic';
export default async function AdminDashboard() {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');
  const [competitions, categories, nominees, pending, payments] = await Promise.all([
    prisma.competition.count(), prisma.category.count(), prisma.nominee.count(),
    prisma.nominationSubmission.count({ where: { status: 'PENDING' } }),
    prisma.payment.aggregate({ where: { status: 'SUCCESS' }, _sum: { amount: true } }),
  ]);
  return <main className="mx-auto min-h-screen max-w-7xl px-5 py-10 sm:px-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><p className="text-xs tracking-[.3em] text-amber-200">MOUNT KENYA AWARDS · CONTROL CENTRE</p><h1 className="mt-2 text-4xl font-black gold-text">Administrator dashboard</h1><p className="mt-2 text-sm text-stone-400">Super administrator access</p></div>
      <form action="/api/admin/logout" method="post"><button className="rounded-full border border-white/20 px-5 py-2 text-sm">Sign out</button></form>
    </div>
    <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {([['Competitions', competitions], ['Categories', categories], ['Nominees', nominees], ['Pending nominations', pending], ['Confirmed revenue', `KSh ${(payments._sum.amount || 0).toLocaleString('en-KE')}`]] as const).map(([label, value]) =>
        <div key={label} className="rounded-2xl border border-amber-300/20 bg-stone-950 p-5"><p className="text-xs text-stone-400">{label}</p><p className="mt-3 text-2xl font-black text-amber-200">{value}</p></div>)}
    </div>
    <AdminConsole />
    <p className="mt-8 text-xs leading-6 text-stone-500">Payment processing remains disabled until an eligible M-Pesa Business shortcode and Daraja credentials are configured and the callback flow is implemented and security-tested. Do not accept live payments on this development build.</p>
  </main>;
}
