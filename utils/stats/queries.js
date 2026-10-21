// utils/stats/queries.js — the numbers shown on the dashboard (server only).
//
// Definitions (the same everywhere):
//   views   = every time the page was opened
//   readers = different browsers that opened it
//   reads   = different browsers that, in one sitting, kept the tab visible
//             READ_MIN_SECONDS and got READ_MIN_SCROLL % through the text
//
// `days` is the period length in Tbilisi days (1 = today), or null = all time.

import { statsQuery } from './db';
import { READ_MIN_SCROLL, READ_MIN_SECONDS, STATS_TIMEZONE as TZ } from './config';

// Start of the period as a timestamp: midnight in Tbilisi, (days - 1) days ago.
const periodStart = (i) => `(CASE WHEN $${i}::int IS NULL THEN '-infinity'::timestamptz
  ELSE (date_trunc('day', now() AT TIME ZONE '${TZ}') - make_interval(days => $${i}::int - 1)) AT TIME ZONE '${TZ}' END)`;

const isRead = (s, p) => `engaged_seconds >= $${s} AND max_scroll >= $${p}`;

const COUNTS = (s, p) => `
  count(*)::int AS views,
  count(DISTINCT visitor_id)::int AS readers,
  count(DISTINCT visitor_id) FILTER (WHERE ${isRead(s, p)})::int AS reads,
  coalesce(round(percentile_cont(0.5) WITHIN GROUP (ORDER BY engaged_seconds)), 0)::int AS median_seconds`;

const EMPTY = { views: 0, readers: 0, reads: 0, median_seconds: 0 };

/** Totals for one content type (e.g. all articles together). */
export async function getTypeSummary(type, days) {
  const rows = await statsQuery(
    `SELECT ${COUNTS(3, 4)} FROM stats_opens
     WHERE content_type = $1 AND opened_at >= ${periodStart(2)}`,
    [type, days, READ_MIN_SECONDS, READ_MIN_SCROLL]
  );
  return rows[0] || EMPTY;
}

/** Numbers for every post that has at least one open: Map<postId, counts>. */
export async function getPerPost(type, days) {
  const rows = await statsQuery(
    `SELECT post_id, ${COUNTS(3, 4)} FROM stats_opens
     WHERE content_type = $1 AND opened_at >= ${periodStart(2)}
     GROUP BY post_id`,
    [type, days, READ_MIN_SECONDS, READ_MIN_SCROLL]
  );
  return new Map(rows.map((r) => [r.post_id, r]));
}

/** Totals for one post. */
export async function getPostSummary(type, postId, days) {
  const rows = await statsQuery(
    `SELECT ${COUNTS(4, 5)} FROM stats_opens
     WHERE content_type = $1 AND post_id = $2 AND opened_at >= ${periodStart(3)}`,
    [type, postId, days, READ_MIN_SECONDS, READ_MIN_SCROLL]
  );
  return rows[0] || EMPTY;
}

/** One post, split by language (ka / en / ru). */
export async function getPostByLang(type, postId, days) {
  return statsQuery(
    `SELECT lang, ${COUNTS(4, 5)} FROM stats_opens
     WHERE content_type = $1 AND post_id = $2 AND opened_at >= ${periodStart(3)}
     GROUP BY lang ORDER BY views DESC`,
    [type, postId, days, READ_MIN_SECONDS, READ_MIN_SCROLL]
  );
}

/**
 * One post, day by day (Tbilisi days), with empty days filled in as 0.
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
