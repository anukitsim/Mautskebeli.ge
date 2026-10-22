// utils/stats/queries.js — the numbers shown on the dashboard (server only).
//
// Definitions (the same everywhere):
//   views        = every time a page was opened
//   readers      = different browsers that opened it
//   reader_items = different (browser, item) pairs — for one item this equals readers
//   reads        = (browser, item) pairs where, in one sitting, the tab was visible
//                  READ_MIN_SECONDS and READ_MIN_SCROLL % of the text was passed.
//                  For one item: different browsers that really read it.
//                  For a total: the sum of the items' reads.
//
// `days` is the period length in Tbilisi days (1 = today), or null = all time.

import { statsQuery } from './db';
import { READ_MIN_SCROLL, READ_MIN_SECONDS, STATS_TIMEZONE as TZ } from './config';

// Start of the period as a timestamp: midnight in Tbilisi, (days - 1) days ago.
const periodStart = (i) => `(CASE WHEN $${i}::int IS NULL THEN '-infinity'::timestamptz
  ELSE (date_trunc('day', now() AT TIME ZONE '${TZ}') - make_interval(days => $${i}::int - 1)) AT TIME ZONE '${TZ}' END)`;

const COUNTS = (s, p) => `
  count(*)::int AS views,
  count(DISTINCT visitor_id)::int AS readers,
  count(DISTINCT (visitor_id, content_type, post_id))::int AS reader_items,
  count(DISTINCT (visitor_id, content_type, post_id))
    FILTER (WHERE engaged_seconds >= $${s} AND max_scroll >= $${p})::int AS reads,
  coalesce(round(percentile_cont(0.5) WITHIN GROUP (ORDER BY engaged_seconds)), 0)::int AS median_seconds`;

export const EMPTY_COUNTS = { views: 0, readers: 0, reader_items: 0, reads: 0, median_seconds: 0 };

/** Totals for all content together. */
export async function getSiteSummary(days) {
  const rows = await statsQuery(
    `SELECT ${COUNTS(2, 3)} FROM stats_opens WHERE opened_at >= ${periodStart(1)}`,
    [days, READ_MIN_SECONDS, READ_MIN_SCROLL]
  );
  return rows[0] || EMPTY_COUNTS;
}

/** Totals per content type: Map<type, counts>. */
export async function getTypeBreakdown(days) {
  const rows = await statsQuery(
    `SELECT content_type, ${COUNTS(2, 3)} FROM stats_opens
     WHERE opened_at >= ${periodStart(1)} GROUP BY content_type`,
    [days, READ_MIN_SECONDS, READ_MIN_SCROLL]
  );
  return new Map(rows.map((r) => [r.content_type, r]));
}

/** The most-read items across all content types. */
export async function getTopItems(days, limit = 10) {
  return statsQuery(
    `SELECT content_type, post_id, ${COUNTS(2, 3)} FROM stats_opens
     WHERE opened_at >= ${periodStart(1)}
     GROUP BY content_type, post_id
     ORDER BY reads DESC, views DESC LIMIT $4`,
    [days, READ_MIN_SECONDS, READ_MIN_SCROLL, limit]
  );
}

/** Totals for one content type. */
export async function getTypeSummary(type, days) {
  const rows = await statsQuery(
    `SELECT ${COUNTS(3, 4)} FROM stats_opens
     WHERE content_type = $1 AND opened_at >= ${periodStart(2)}`,
    [type, days, READ_MIN_SECONDS, READ_MIN_SCROLL]
  );
  return rows[0] || EMPTY_COUNTS;
}

/** Numbers for every item of a type that has at least one open: Map<postId, counts>. */
export async function getPerPost(type, days) {
  const rows = await statsQuery(
    `SELECT post_id, ${COUNTS(3, 4)} FROM stats_opens
     WHERE content_type = $1 AND opened_at >= ${periodStart(2)}
     GROUP BY post_id`,
    [type, days, READ_MIN_SECONDS, READ_MIN_SCROLL]
  );
  return new Map(rows.map((r) => [r.post_id, r]));
}

/** Totals for one item. */
export async function getPostSummary(type, postId, days) {
  const rows = await statsQuery(
    `SELECT ${COUNTS(4, 5)} FROM stats_opens
     WHERE content_type = $1 AND post_id = $2 AND opened_at >= ${periodStart(3)}`,
    [type, postId, days, READ_MIN_SECONDS, READ_MIN_SCROLL]
  );
  return rows[0] || EMPTY_COUNTS;
}

/** One item, split by language (ka / en / ru). */
export async function getPostByLang(type, postId, days) {
  return statsQuery(
    `SELECT lang, ${COUNTS(4, 5)} FROM stats_opens
     WHERE content_type = $1 AND post_id = $2 AND opened_at >= ${periodStart(3)}
     GROUP BY lang ORDER BY views DESC`,
    [type, postId, days, READ_MIN_SECONDS, READ_MIN_SCROLL]
  );
}

/**
 * One item, day by day (Tbilisi days), with empty days filled in as 0.
 * Note: "readers" here is per day — someone reading on two days counts on both.
 */
export async function getPostDaily(type, postId, days) {
  return statsQuery(
    `WITH s AS (
       SELECT (opened_at AT TIME ZONE '${TZ}')::date AS day, visitor_id, engaged_seconds, max_scroll
       FROM stats_opens
       WHERE content_type = $1 AND post_id = $2 AND opened_at >= ${periodStart(3)}
     ),
     bounds AS (
       SELECT (now() AT TIME ZONE '${TZ}')::date AS today,
              CASE WHEN $3::int IS NULL THEN (SELECT min(day) FROM s)
                   ELSE (now() AT TIME ZONE '${TZ}')::date - ($3::int - 1) END AS first_day
     ),
     calendar AS (
       SELECT generate_series(coalesce(first_day, today), today, interval '1 day')::date AS day
       FROM bounds
     )
     SELECT to_char(calendar.day, 'YYYY-MM-DD') AS day,
            count(s.visitor_id)::int AS views,
            count(DISTINCT s.visitor_id)::int AS readers,
            count(DISTINCT s.visitor_id)
              FILTER (WHERE s.engaged_seconds >= $4 AND s.max_scroll >= $5)::int AS reads
     FROM calendar LEFT JOIN s ON s.day = calendar.day
     GROUP BY calendar.day ORDER BY calendar.day`,
    [type, postId, days, READ_MIN_SECONDS, READ_MIN_SCROLL]
  );
}

/** How long people stayed (per open), in fixed groups. */
export const TIME_BUCKETS = [
  { key: 0, label: '15 წამზე ნაკლები' },
  { key: 1, label: '15–45 წამი' },
  { key: 2, label: '45 წამი – 2 წუთი' },
  { key: 3, label: '2–5 წუთი' },
  { key: 4, label: '5 წუთზე მეტი' },
];

export async function getPostTimeBuckets(type, postId, days) {
  const rows = await statsQuery(
    `SELECT CASE WHEN engaged_seconds < 15 THEN 0 WHEN engaged_seconds < 45 THEN 1
                 WHEN engaged_seconds < 120 THEN 2 WHEN engaged_seconds < 300 THEN 3 ELSE 4 END AS bucket,
            count(*)::int AS n
     FROM stats_opens
     WHERE content_type = $1 AND post_id = $2 AND opened_at >= ${periodStart(3)}
     GROUP BY 1`,
    [type, postId, days]
  );
  const byKey = new Map(rows.map((r) => [r.bucket, r.n]));
  return TIME_BUCKETS.map((b) => ({ ...b, n: byKey.get(b.key) || 0 }));
}

/** Filter health: accepted opens and rejected signals, by reason. */
export async function getFilterHealth(days) {
  const [accepted] = await statsQuery(
    `SELECT count(*)::int AS opens FROM stats_opens WHERE opened_at >= ${periodStart(1)}`,
    [days]
  );
  const rejected = await statsQuery(
    `SELECT reason, sum(n)::int AS n FROM stats_rejections
     WHERE ($1::int IS NULL OR day >= (now() AT TIME ZONE '${TZ}')::date - ($1::int - 1))
     GROUP BY reason ORDER BY n DESC`,
    [days]
  );
  return { opens: accepted?.opens || 0, rejected };
}
