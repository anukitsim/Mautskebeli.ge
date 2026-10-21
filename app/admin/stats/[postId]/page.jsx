// app/admin/stats/[postId]/page.jsx — one article in detail.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '../../_lib/guard';
import AdminShell, { NotConfigured, PeriodChips } from '../../_components/AdminShell';
import DailyChart from '../../_components/DailyChart';
import { fmtDate, fmtDay, fmtDuration, fmtNumber, fmtPercent, LANG_LABELS, readPeriod } from '../../_lib/format';
import { isStatsEnabled } from '@/utils/stats/ticket';
import { getPostByLang, getPostDaily, getPostSummary, getPostTimeBuckets } from '@/utils/stats/queries';
import { articleUrl, fetchArticleIndex } from '@/utils/stats/wordpress';
import { PERIODS } from '@/utils/stats/config';

export const dynamic = 'force-dynamic';

function HBars({ items }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="hbars">
      {items.map((i) => (
        <div className="hbar" key={i.label}>
          <span>{i.label}</span>
          <span className="hbar-track">
            <span className="hbar-fill" style={{ width: `${(i.value / max) * 85}%` }} />
            <span className="hbar-value">{i.text}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

export default async function ArticleStats({ params, searchParams }) {
  const session = await requireAdmin();
  const postId = Number(params.postId);
  if (!Number.isInteger(postId) || postId <= 0) notFound();
  const period = readPeriod(searchParams);

  if (!isStatsEnabled()) {
    return (
      <AdminShell session={session} active="articles">
        <NotConfigured />
      </AdminShell>
    );
  }

  const days = PERIODS[period].days;
  const [summary, byLang, daily, buckets, articles] = await Promise.all([
    getPostSummary('article', postId, days),
    getPostByLang('article', postId, days),
    getPostDaily('article', postId, days),
    getPostTimeBuckets('article', postId, days),
    fetchArticleIndex(),
  ]);
  const article = articles.get(postId);
  const totalOpens = buckets.reduce((s, b) => s + b.n, 0);

  return (
    <AdminShell session={session} active="articles">
      <Link className="back" href={`/admin/stats?period=${period}`}>← ყველა სტატია</Link>
      <h1 className="page-title">{article?.title || `სტატია #${postId}`}</h1>
      <div className="page-meta">
        {[article?.author, fmtDate(article?.date)].filter(Boolean).join(' · ')}
        {article && (
          <>
            {' · '}
            <a href={articleUrl(article)} target="_blank" rel="noopener noreferrer">გახსენი საიტზე ↗</a>
          </>
        )}
      </div>

      <PeriodChips basePath={`/admin/stats/${postId}`} period={period} />

      <div className="tiles">
        <div className="tile">
          <div className="tile-label">ნახვები</div>
          <div className="tile-value">{fmtNumber(summary.views)}</div>
          <div className="tile-note">ყველა გახსნა</div>
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
        <div className="tile">
          <div className="tile-label">ტიპიური დრო</div>
          <div className="tile-value">{summary.views ? fmtDuration(summary.median_seconds) : '—'}</div>
          <div className="tile-note">ნახევარი უფრო მოკლე, ნახევარი — გრძელი</div>
        </div>
      </div>

      <section className="card">
        <h2>დღეების მიხედვით</h2>
        <p className="sub">თბილისის დროით. „მკითხველი“ აქ ითვლება ყოველ დღეს ცალ-ცალკე.</p>
        <DailyChart data={daily.map((d) => ({ ...d, label: fmtDay(d.day) }))} />
      </section>

      <section className="card">
        <h2>ენების მიხედვით</h2>
        <p className="sub">ერთი და იგივე სტატია ქართულად, ინგლისურად და რუსულად.</p>
        {byLang.length ? (
          <HBars
            items={byLang.map((l) => ({
              label: LANG_LABELS[l.lang] || l.lang,
              value: l.views,
              text: `${fmtNumber(l.views)} ნახვა · ${fmtNumber(l.readers)} მკითხველი · ${fmtNumber(l.reads)} წაკითხული`,
            }))}
          />
        ) : (
          <p className="sub">ამ პერიოდში ჯერ არავის გაუხსნია.</p>
        )}
      </section>

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
    </AdminShell>
  );
}
