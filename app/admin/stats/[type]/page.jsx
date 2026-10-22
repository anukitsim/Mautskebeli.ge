// app/admin/stats/[type]/page.jsx — one content type: totals, audience, every item.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '../../_lib/guard';
import AdminShell, { NotConfigured, PeriodChips } from '../../_components/AdminShell';
import AudienceCards from '../../_components/AudienceCards';
import HowWeCount from '../../_components/HowWeCount';
import StatTiles from '../../_components/StatTiles';
import { fmtDate, fmtDuration, fmtNumber, readPeriod } from '../../_lib/format';
import { isStatsEnabled } from '@/utils/stats/ticket';
import { EMPTY_COUNTS, getAudience, getPerPost, getTypeSummary } from '@/utils/stats/queries';
import { fetchContentIndex } from '@/utils/stats/wordpress';
import { CONTENT_TYPES, isContentType } from '@/utils/stats/content-types';
import { PERIODS } from '@/utils/stats/config';

export const dynamic = 'force-dynamic';

const SORTS = {
  reads: { label: 'მკითხველი', get: (r) => r.reads },
  views: { label: 'ნახვა', get: (r) => r.views },
  time: { label: 'საშუალო დრო', get: (r) => (r.views ? r.avg_seconds : -1) },
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
  const [summary, perPost, items, audience] = await Promise.all([
    getTypeSummary(type, days),
    getPerPost(type, days),
    fetchContentIndex(type),
    getAudience({ type, days }),
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
          {['reads', 'views', 'time', 'date'].map((key) => (
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
                {th('views', 'ნახვა')}
                {th('reads', 'მკითხველი')}
                {th('time', 'საშუალო დრო')}
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
                  <td className="num" data-label="ნახვა">{fmtNumber(r.views)}</td>
                  <td className="num" data-label="მკითხველი">{fmtNumber(r.reads)}</td>
                  <td className="num" data-label="საშუალო დრო">{r.views ? fmtDuration(r.avg_seconds) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <AudienceCards audience={audience} />
    </AdminShell>
  );
}
