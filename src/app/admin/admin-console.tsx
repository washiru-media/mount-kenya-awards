"use client";

import { useEffect, useState } from 'react';

type Competition = { id: string; name: string; status: string; description?: string | null; _count?: { categories: number } };
type Category = { id: string; name: string; competition?: { name: string }; _count?: { nominees: number } };
type Nomination = { id: string; categoryId: string; nomineeName: string; biography?: string | null; photoUrl?: string | null; submitterName: string; submitterEmail?: string | null; submitterPhone?: string | null; createdAt: string };
type Nominee = { id: string; fullName: string; status: string; votes: number; category: { name: string; competition: { name: string } } };

const inputClass = "mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-300";
const panelClass = "rounded-2xl border border-amber-200/15 bg-stone-950 p-5";
const buttonClass = "rounded-xl bg-amber-300 px-4 py-2.5 text-sm font-bold text-stone-950 disabled:opacity-50";
const secondaryClass = "rounded-xl border border-white/15 px-4 py-2 text-sm hover:border-amber-200/50";

export default function AdminConsole() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [competitionName, setCompetitionName] = useState("");
  const [competitionDescription, setCompetitionDescription] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categoryCompetition, setCategoryCompetition] = useState("");
  const [nomineeName, setNomineeName] = useState("");
  const [nomineeCategory, setNomineeCategory] = useState("");
  const [nomineeBio, setNomineeBio] = useState("");
  const [nomineePhoto, setNomineePhoto] = useState("");

  async function load() {
    const [c, g, n, m] = await Promise.all([
      fetch('/api/admin/competitions').then(r => r.ok ? r.json() : []),
      fetch('/api/admin/categories').then(r => r.ok ? r.json() : []),
      fetch('/api/admin/nominations').then(r => r.ok ? r.json() : []),
      fetch('/api/admin/nominees').then(r => r.ok ? r.json() : []),
    ]);
    setCompetitions(c); setCategories(g); setNominations(n); setNominees(m);
    if (!categoryCompetition && c[0]) setCategoryCompetition(c[0].id);
    if (!nomineeCategory && g[0]) setNomineeCategory(g[0].id);
  }
  useEffect(() => { load().catch(() => setMessage("Could not load administrator data.")); }, []);

  async function request(url: string, method: string, body?: unknown) {
    setBusy(true); setMessage("");
    try {
      const res = await fetch(url, { method, headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Request failed.');
      setMessage("Saved successfully."); await load();
      return data;
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Something went wrong.'); return null; }
    finally { setBusy(false); }
  }

  async function createCompetition(e: React.FormEvent) {
    e.preventDefault();
    const result = await request('/api/admin/competitions', 'POST', { name: competitionName, description: competitionDescription || undefined });
    if (result) { setCompetitionName(''); setCompetitionDescription(''); }
  }
  async function createCategory(e: React.FormEvent) {
    e.preventDefault();
    const result = await request('/api/admin/categories', 'POST', { competitionId: categoryCompetition, name: categoryName });
    if (result) setCategoryName('');
  }
  async function createNominee(e: React.FormEvent) {
    e.preventDefault();
    const result = await request('/api/admin/nominees', 'POST', { categoryId: nomineeCategory, fullName: nomineeName, biography: nomineeBio || undefined, photoUrl: nomineePhoto || undefined });
    if (result) { setNomineeName(''); setNomineeBio(''); setNomineePhoto(''); }
  }
  async function review(id: string, decision: 'APPROVED' | 'REJECTED') {
    await request('/api/admin/nominations', 'PATCH', { nominationId: id, decision });
  }

  return <div className="mt-8 space-y-7">
    {message && <div role="status" className="rounded-xl border border-amber-200/20 bg-amber-200/10 px-4 py-3 text-sm text-amber-100">{message}</div>}
    <section className={panelClass}>
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-bold">Competitions</h2><p className="mt-1 text-sm text-stone-400">Create an awards season and control its public voting status.</p></div><span className="text-xs text-stone-500">{competitions.length} total</span></div>
      <form onSubmit={createCompetition} className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <input className={inputClass} placeholder="Competition name" value={competitionName} onChange={e => setCompetitionName(e.target.value)} required minLength={3} />
        <input className={inputClass} placeholder="Short description (optional)" value={competitionDescription} onChange={e => setCompetitionDescription(e.target.value)} />
        <button className={buttonClass} disabled={busy}>Create competition</button>
      </form>
      <div className="mt-5 divide-y divide-white/10">{competitions.map(c => <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
        <div><p className="font-semibold">{c.name}</p><p className="text-xs text-stone-500">{c._count?.categories ?? 0} categories · {c.status}</p></div>
        <div className="flex flex-wrap gap-2">
          {(['DRAFT','OPEN','CLOSED','ARCHIVED'] as const).filter(s => s !== c.status).map(s => <button key={s} className={secondaryClass} disabled={busy} onClick={() => request('/api/admin/competitions', 'PATCH', { id: c.id, status: s })}>{s === 'OPEN' ? 'Open voting' : s === 'CLOSED' ? 'Close voting' : s === 'ARCHIVED' ? 'Archive' : 'Set draft'}</button>)}
        </div>
      </div>)}</div>
      <p className="mt-3 text-xs text-amber-100/70">Public nominations are accepted only when their competition is OPEN. Open voting only after checking categories and nominee details.</p>
    </section>

    <section className={panelClass}>
      <h2 className="text-xl font-bold">Categories</h2><p className="mt-1 text-sm text-stone-400">Add award categories under a competition.</p>
      <form onSubmit={createCategory} className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <select className={inputClass} value={categoryCompetition} onChange={e => setCategoryCompetition(e.target.value)} required><option value="">Select competition</option>{competitions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <input className={inputClass} placeholder="Category name" value={categoryName} onChange={e => setCategoryName(e.target.value)} required minLength={2} />
        <button className={buttonClass} disabled={busy || !competitions.length}>Add category</button>
      </form>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{categories.map(c => <div key={c.id} className="rounded-xl border border-white/10 p-3"><p className="font-semibold">{c.name}</p><p className="text-xs text-stone-500">{c.competition?.name} · {c._count?.nominees ?? 0} nominees</p></div>)}</div>
    </section>

    <section className={panelClass}>
      <h2 className="text-xl font-bold">Add nominee manually</h2><p className="mt-1 text-sm text-stone-400">Administrator-added candidates are approved immediately.</p>
      <form onSubmit={createNominee} className="mt-4 grid gap-3 md:grid-cols-2">
        <select className={inputClass} value={nomineeCategory} onChange={e => setNomineeCategory(e.target.value)} required><option value="">Select category</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name} — {c.competition?.name}</option>)}</select>
        <input className={inputClass} placeholder="Candidate full name" value={nomineeName} onChange={e => setNomineeName(e.target.value)} required minLength={2} />
        <input className={inputClass} placeholder="Candidate photo URL (optional)" type="url" value={nomineePhoto} onChange={e => setNomineePhoto(e.target.value)} />
        <input className={inputClass} placeholder="Short biography (optional)" value={nomineeBio} onChange={e => setNomineeBio(e.target.value)} />
        <button className={`${buttonClass} md:col-span-2`} disabled={busy || !categories.length}>Add approved nominee</button>
      </form>
    </section>

    <section className={panelClass}>
      <div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-bold">Public nominations awaiting review</h2><p className="mt-1 text-sm text-stone-400">Approve to create a candidate profile, or reject the submission.</p></div><span className="rounded-full bg-amber-200/10 px-3 py-1 text-sm text-amber-100">{nominations.length} pending</span></div>
      {nominations.length === 0 ? <p className="mt-5 text-sm text-stone-500">No pending public nominations.</p> : <div className="mt-4 space-y-3">{nominations.map(n => <article key={n.id} className="rounded-xl border border-white/10 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold">{n.nomineeName}</h3><p className="mt-1 text-xs text-stone-400">Submitted by {n.submitterName} · {new Date(n.createdAt).toLocaleDateString()}</p><p className="text-xs text-stone-500">{n.submitterEmail || 'No email'} · {n.submitterPhone || 'No phone'}</p></div><div className="flex gap-2"><button className={buttonClass} disabled={busy} onClick={() => review(n.id, 'APPROVED')}>Approve</button><button className={secondaryClass} disabled={busy} onClick={() => review(n.id, 'REJECTED')}>Reject</button></div></div>
        {n.biography && <p className="mt-3 text-sm text-stone-300">{n.biography}</p>}{n.photoUrl && <a className="mt-2 inline-block text-xs text-amber-200 underline" href={n.photoUrl} target="_blank" rel="noreferrer">View submitted photo</a>}
      </article>)}</div>}
    </section>

    <section className={panelClass}>
      <h2 className="text-xl font-bold">Nominee register</h2><p className="mt-1 text-sm text-stone-400">Candidates currently stored in the platform.</p>
      <div className="mt-4 space-y-2">{nominees.map(n => <div key={n.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 py-2 text-sm"><div><span className="font-semibold">{n.fullName}</span><span className="ml-2 text-xs text-stone-500">{n.category.name} · {n.category.competition.name}</span></div><span className="text-xs text-amber-100">{n.status} · {n.votes.toLocaleString()} votes</span></div>)}</div>
    </section>
  </div>;
}
