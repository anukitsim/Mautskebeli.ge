// app/admin/stats/page.jsx — overview: all content together, per type, audience, top items.

import Link from 'next/link';
import { requireAdmin } from '../_lib/guard';
import AdminShell, { NotConfigured, PeriodChips } from '../_components/AdminShell';
import AudienceCards from '../_components/AudienceCards';
import HowWeCount from '../_components/HowWeCount';
import StatTiles from '../_components/StatTiles';
import { fmtDuration, fmtNumber, readPeriod } from '../_lib/format';
import { isStatsEnabled } from '@/utils/stats/ticket';
import { EMPTY_COUNTS, getAudience, getSiteSummary, getTopItems, getTypeBreakdown } from '@/utils/stats/queries';
import { fetchContentIndex } from '@/utils/stats/wordpress';
import { CONTENT_TYPES, TYPE_ORDER } from '@/utils/stats/content-types';
import { PERIODS } from '@/utils/stats/config';

export const dynamic = 'force-dynamic';

export default async function StatsOverview({ searchParams }) {
  const session = await requireAdmin();
  const period = readPeriod(searchParams);

  if (!isStatsEnabled()) {
    return (
      <AdminShell session={session} active="overview">
        <NotConfigured />
      </AdminShell>
    );
  }

  const days = PERIODS[period].days;
  const [summary, byType, top, audience] = await Promise.all([
    getSiteSummary(days),
    getTypeBreakdown(days),
    getTopItems(days, 10),
    getAudience({ days }),
  ]);
  // Titles only for the types that appear in the top list.
  const topTypes = [...new Set(top.map((t) => t.content_type))];
  const indexes = new Map(
    await Promise.all(topTypes.map(async (type) => [type, await fetchContentIndex(type)]))
  );

  return (
    <AdminShell session={session} active="overview">
      <PeriodChips basePath="/admin/stats" period={period} />
      <StatTiles counts={summary} />
      <HowWeCount />

      <section className="card">
        <h2>კონტენტის მიხედვით</h2>
        <p className="sub">{PERIODS[period].label} · დააჭირეთ სახელს სრული სიისთვის</p>
        <div className="table-scroll">
          <table className="stats-table cards">
            <thead>
              <tr>
                <th scope="col">ტიპი</th>
                <th className="num" scope="col">ნახვა</th>
                <th className="num" scope="col">მკითხველი</th>
                <th className="num" scope="col">საშუალო დრო</th>
              </tr>
            </thead>
            <tbody>
              {TYPE_ORDER.map((type) => {
                const c = byType.get(type) || EMPTY_COUNTS;
                return (
                  <tr key={type} className={c.views ? undefined : 'zero'}>
                    <td>
                      <Link className="title-link" href={`/admin/stats/${type}?period=${period}`}>
                        {CONTENT_TYPES[type].label}
                      </Link>
                    </td>
                    <td className="num" data-label="ნახვა">{fmtNumber(c.views)}</td>
                    <td className="num" data-label="მკითხველი">{fmtNumber(c.reads)}</td>
                    <td className="num" data-label="საშუალო დრო">{c.views ? fmtDuration(c.avg_seconds) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2>ყველაზე წაკითხული</h2>
        <p className="sub">{PERIODS[period].label} · ყველა ტიპი ერთად, მკითხველების მიხედვით</p>
        {top.length ? (
          <div className="table-scroll">
            <table className="stats-table cards">
              <thead>
                <tr>
                  <th scope="col">სათაური</th>
                  <th className="num" scope="col">ნახვა</th>
                  <th className="num" scope="col">მკითხველი</th>
                  <th className="num" scope="col">საშუალო დრო</th>
                </tr>
              </thead>
              <tbody>
                {top.map((t) => {
                  const item = indexes.get(t.content_type)?.get(t.post_id);
                  return (
                    <tr key={`${t.content_type}-${t.post_id}`}>
                      <td>
                        <Link className="title-link" href={`/admin/stats/${t.content_type}/${t.post_id}?period=${period}`}>
                          {item?.title || `#${t.post_id}`}
                        </Link>
                        <div className="meta">{CONTENT_TYPES[t.content_type]?.label}</div>
                      </td>
                      <td className="num" data-label="ნახვა">{fmtNumber(t.views)}</td>
                      <td className="num" data-label="მკითხველი">{fmtNumber(t.reads)}</td>
                      <td className="num" data-label="საშუალო დრო">{fmtDuration(t.avg_seconds)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="sub">ამ პერიოდში ჯერ არავის გაუხსნია.</p>
        )}
      </section>

      <AudienceCards audience={audience} />
    </AdminShell>
  );
}
