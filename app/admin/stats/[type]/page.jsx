// app/admin/stats/[type]/page.jsx — one content type: totals + every item, sortable.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '../../_lib/guard';
import AdminShell, { NotConfigured, PeriodChips } from '../../_components/AdminShell';
import HowWeCount from '../../_components/HowWeCount';
import StatTiles from '../../_components/StatTiles';
import { fmtDate, fmtDuration, fmtNumber, fmtPercent, readPeriod } from '../../_lib/format';
import { isStatsEnabled } from '@/utils/stats/ticket';
import { EMPTY_COUNTS, getPerPost, getTypeSummary } from '@/utils/stats/queries';
import { fetchContentIndex } from '@/utils/stats/wordpress';
import { CONTENT_TYPES, isContentType } from '@/utils/stats/content-types';
import { PERIODS } from '@/utils/stats/config';

export const dynamic = 'force-dynamic';

const SORTS = {
  reads: { label: 'რეალურად წაკითხული', get: (r) => r.reads },
  readers: { label: 'მკითხველები', get: (r) => r.readers },
  views: { label: 'ნახვები', get: (r) => r.views },
  rate: { label: 'წაკითხვის წილი', get: (r) => (r.readers ? r.reads / r.readers : -1) },
  date: { label: 'გამოქვეყნება', get: (r) => (r.date ? Date.parse(r.date) : 0) },
};

export default async function TypeStats({ params, searchParams }) {
  const session = await requireAdmin();
  const { type } = params;
  if (!isContentType(type)) notFound();
  const period = readPeriod(searchParams);
  const sort = SORTS[searchParams?.sort] ? searchParams.sort : 'reads';

  if (!isStatsEnabled()) {
    return (
      <AdminShell session={session} active={type}>
        <NotConfigured />
      </AdminShell>
    );
  }

  const days = PERIODS[period].days;
  const [summary, perPost, items] = await Promise.all([
    getTypeSummary(type, days),
    getPerPost(type, days),
    fetchContentIndex(type),
  ]);

  // Every item from WordPress (also those nobody opened yet), plus any
  // counted item WordPress no longer returns (e.g. unpublished).
  const ids = new Set([...items.keys(), ...perPost.keys()]);
  const rows = [...ids].map((id) => {
    const a = items.get(id);
    const s = perPost.get(id) || EMPTY_COUNTS;
    return { id, title: a?.title || `#${id} (WordPress-ში ვერ მოიძებნა)`, author: a?.author, date: a?.date, ...s };
  });
  rows.sort((x, y) => SORTS[sort].get(y) - SORTS[sort].get(x) || y.views - x.views);

  const base = `/admin/stats/${type}`;
  const q = (s) => `${base}?period=${period}&sort=${s}`;
  const th = (key, label) => (
    <th className="num" scope="col">
      <Link href={q(key)} aria-current={sort === key ? 'true' : undefined}>
        {label}
        {sort === key ? ' ↓' : ''}
      </Link>
    </th>
  );

  return (
    <AdminShell session={session} active={type}>
      <PeriodChips basePath={base} period={period} extraQuery={`&sort=${sort}`} />
      <StatTiles counts={summary} />
      <HowWeCount />

      <section className="card">
        <h2>{CONTENT_TYPES[type].label}</h2>
        <p className="sub">
          {PERIODS[period].label} · {rows.length} ერთეული · დააჭირეთ სვეტის სათაურს დასალაგებლად
        </p>
        <div className="sort-mobile">
          დალაგება:
          {['reads', 'readers', 'views', 'rate'].map((key) => (
            <Link key={key} className="chip" href={q(key)} aria-current={sort === key ? 'true' : undefined}>
              {SORTS[key].label}
            </Link>
          ))}
        </div>
        <div className="table-scroll">
          <table className="stats-table cards">
            <thead>
              <tr>
                <th scope="col">სათაური</th>
                {th('views', 'ნახვები')}
                {th('readers', 'მკითხველები')}
                {th('reads', 'რეალურად წაკითხული')}
                {th('rate', 'წაკითხვის წილი')}
                <th className="num" scope="col">ტიპიური დრო</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={r.views ? undefined : 'zero'}>
                  <td>
                    <Link className="title-link" href={`${base}/${r.id}?period=${period}`}>
                      {r.title}
                    </Link>
                    <div className="meta">{[r.author, fmtDate(r.date)].filter(Boolean).join(' · ')}</div>
                  </td>
                  <td className="num" data-label="ნახვები">{fmtNumber(r.views)}</td>
                  <td className="num" data-label="მკითხველები">{fmtNumber(r.readers)}</td>
                  <td className="num" data-label="წაკითხული">{fmtNumber(r.reads)}</td>
                  <td className="num" data-label="წაკითხვის წილი">{fmtPercent(r.reads, r.readers)}</td>
                  <td className="num" data-label="ტიპიური დრო">{r.views ? fmtDuration(r.median_seconds) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
