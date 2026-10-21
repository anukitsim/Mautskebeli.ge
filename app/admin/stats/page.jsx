// app/admin/stats/page.jsx — overview: totals + every article, sortable.

import Link from 'next/link';
import { requireAdmin } from '../_lib/guard';
import AdminShell, { NotConfigured, PeriodChips } from '../_components/AdminShell';
import HowWeCount from '../_components/HowWeCount';
import { fmtDate, fmtDuration, fmtNumber, fmtPercent, readPeriod } from '../_lib/format';
import { isStatsEnabled } from '@/utils/stats/ticket';
import { getPerPost, getTypeSummary } from '@/utils/stats/queries';
import { fetchArticleIndex } from '@/utils/stats/wordpress';
import { PERIODS } from '@/utils/stats/config';

export const dynamic = 'force-dynamic';

const SORTS = {
  reads: { label: 'რეალურად წაკითხული', get: (r) => r.reads },
  readers: { label: 'მკითხველები', get: (r) => r.readers },
  views: { label: 'ნახვები', get: (r) => r.views },
  rate: { label: 'წაკითხვის წილი', get: (r) => (r.readers ? r.reads / r.readers : -1) },
  date: { label: 'გამოქვეყნება', get: (r) => (r.date ? Date.parse(r.date) : 0) },
};

export default async function StatsOverview({ searchParams }) {
  const session = await requireAdmin();
  const period = readPeriod(searchParams);
  const sort = SORTS[searchParams?.sort] ? searchParams.sort : 'reads';

  if (!isStatsEnabled()) {
    return (
      <AdminShell session={session} active="articles">
        <NotConfigured />
      </AdminShell>
    );
  }

  const days = PERIODS[period].days;
  const [summary, perPost, articles] = await Promise.all([
    getTypeSummary('article', days),
    getPerPost('article', days),
    fetchArticleIndex(),
  ]);

  // Every article from WordPress (also those nobody opened yet), plus any
  // counted post WordPress no longer returns (e.g. unpublished).
  const ids = new Set([...articles.keys(), ...perPost.keys()]);
  const rows = [...ids].map((id) => {
    const a = articles.get(id);
    const s = perPost.get(id) || { views: 0, readers: 0, reads: 0, median_seconds: 0 };
    return { id, title: a?.title || `#${id} (WordPress-ში ვერ მოიძებნა)`, author: a?.author, date: a?.date, ...s };
  });
  rows.sort((x, y) => SORTS[sort].get(y) - SORTS[sort].get(x) || y.views - x.views);

  const q = (s) => `/admin/stats?period=${period}&sort=${s}`;
  const th = (key, label, cls = 'num') => (
    <th className={cls} scope="col">
      <Link href={q(key)} aria-current={sort === key ? 'true' : undefined}>
        {label}
        {sort === key ? ' ↓' : ''}
      </Link>
    </th>
  );

  return (
    <AdminShell session={session} active="articles">
      <PeriodChips basePath="/admin/stats" period={period} extraQuery={`&sort=${sort}`} />

      <div className="tiles">
        <div className="tile">
          <div className="tile-label">ნახვები</div>
          <div className="tile-value">{fmtNumber(summary.views)}</div>
          <div className="tile-note">ყველა გახსნა, ყველა სტატიაზე</div>
        </div>
        <div className="tile">
          <div className="tile-label">მკითხველები</div>
          <div className="tile-value">{fmtNumber(summary.readers)}</div>
          <div className="tile-note">სხვადასხვა ბრაუზერი</div>
        </div>
        <div className="tile">
          <div className="tile-label">რეალურად წაკითხული</div>
          <div className="tile-value">{fmtNumber(summary.reads)}</div>
          <div className="tile-note">{fmtPercent(summary.reads, summary.readers)} მკითხველებიდან</div>
        </div>
      </div>

      <HowWeCount />

      <section className="card">
        <h2>სტატიები</h2>
        <p className="sub">
          {PERIODS[period].label} · {rows.length} სტატია · დააჭირეთ სვეტის სათაურს დასალაგებლად
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
                <th scope="col">სტატია</th>
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
                    <Link className="title-link" href={`/admin/stats/${r.id}?period=${period}`}>
                      {r.title}
                    </Link>
                    <div className="meta">
                      {[r.author, fmtDate(r.date)].filter(Boolean).join(' · ')}
                    </div>
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
