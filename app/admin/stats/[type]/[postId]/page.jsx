// app/admin/stats/[type]/[postId]/page.jsx — one item in detail.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '../../../_lib/guard';
import AdminShell, { NotConfigured, PeriodChips } from '../../../_components/AdminShell';
import AudienceCards from '../../../_components/AudienceCards';
import DailyChart from '../../../_components/DailyChart';
import HBars from '../../../_components/HBars';
import StatTiles from '../../../_components/StatTiles';
import { fmtDate, fmtDay, fmtNumber, fmtPercent, LANG_LABELS, readPeriod } from '../../../_lib/format';
import { isStatsEnabled } from '@/utils/stats/ticket';
import { getAudience, getPostByLang, getPostDaily, getPostSummary, getPostTimeBuckets } from '@/utils/stats/queries';
import { contentUrl, fetchContentIndex } from '@/utils/stats/wordpress';
import { CONTENT_TYPES, isContentType } from '@/utils/stats/content-types';
import { PERIODS } from '@/utils/stats/config';

export const dynamic = 'force-dynamic';

export default async function ItemStats({ params, searchParams }) {
  const session = await requireAdmin();
  const { type } = params;
  const postId = Number(params.postId);
  if (!isContentType(type) || !Number.isInteger(postId) || postId <= 0) notFound();
  const period = readPeriod(searchParams);

  if (!isStatsEnabled()) {
    return (
      <AdminShell session={session} active={type}>
        <NotConfigured />
      </AdminShell>
    );
  }

  const days = PERIODS[period].days;
  const [summary, byLang, daily, buckets, items, audience] = await Promise.all([
    getPostSummary(type, postId, days),
    getPostByLang(type, postId, days),
    getPostDaily(type, postId, days),
    getPostTimeBuckets(type, postId, days),
    fetchContentIndex(type),
    getAudience({ type, postId, days }),
  ]);
  const item = items.get(postId);
  const totalOpens = buckets.reduce((s, b) => s + b.n, 0);
  const base = `/admin/stats/${type}`;

  return (
    <AdminShell session={session} active={type}>
      <Link className="back" href={`${base}?period=${period}`}>← {CONTENT_TYPES[type].label}</Link>
      <h1 className="page-title">{item?.title || `#${postId}`}</h1>
      <div className="page-meta">
        {[item?.author, fmtDate(item?.date)].filter(Boolean).join(' · ')}
        {item && (
          <>
            {' · '}
            <a href={contentUrl(type, item)} target="_blank" rel="noopener noreferrer">გახსენი საიტზე ↗</a>
          </>
        )}
      </div>

      <PeriodChips basePath={`${base}/${postId}`} period={period} />
      <StatTiles counts={summary} />

      <section className="card">
        <h2>დღეების მიხედვით</h2>
        <p className="sub">თბილისის დროით.</p>
        <DailyChart data={daily.map((d) => ({ ...d, label: fmtDay(d.day) }))} />
      </section>

      {type === 'article' && (
        <section className="card">
          <h2>ენების მიხედვით</h2>
          <p className="sub">ერთი და იგივე სტატია ქართულად, ინგლისურად და რუსულად.</p>
          {byLang.length ? (
            <HBars
              items={byLang.map((l) => ({
                label: LANG_LABELS[l.lang] || l.lang,
                value: l.views,
                text: `${fmtNumber(l.views)} ნახვა · ${fmtNumber(l.reads)} მკითხველი`,
              }))}
            />
          ) : (
            <p className="sub">ამ პერიოდში ჯერ არავის გაუხსნია.</p>
          )}
        </section>
      )}

      <section className="card">
        <h2>რამდენ ხანს დარჩნენ</h2>
        <p className="sub">ყოველი გახსნა, დრო როცა გვერდი ეკრანზე ჩანდა.</p>
        {totalOpens ? (
          <HBars
            items={buckets.map((b) => ({
              label: b.label,
              value: b.n,
              text: `${fmtNumber(b.n)} (${fmtPercent(b.n, totalOpens)})`,
            }))}
          />
        ) : (
          <p className="sub">ამ პერიოდში ჯერ არავის გაუხსნია.</p>
        )}
      </section>

      <AudienceCards audience={audience} />
    </AdminShell>
  );
}
