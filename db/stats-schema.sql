-- Article reading statistics — database schema.
--
-- Safe to run more than once (everything is IF NOT EXISTS).
-- Apply with:  npm run stats:migrate   (reads STATS_DATABASE_URL)
--
-- One row = one time a page was opened in a browser ("an open").
-- Views, readers and real reads are all calculated from these rows,
-- so the reading rule can be changed later and recalculated for all
-- past data.

CREATE TABLE IF NOT EXISTS stats_opens (
  -- Random ID made by the browser for this one open of the page.
  open_id          uuid        PRIMARY KEY,
  -- What kind of content: only 'article' is tracked for now.
  content_type     text        NOT NULL
                   CHECK (content_type IN ('article', 'news', 'free-column', 'translate', 'book')),
  -- WordPress post ID (never changes, unlike the URL/slug).
  post_id          integer     NOT NULL CHECK (post_id > 0),
  lang             text        NOT NULL CHECK (lang IN ('ka', 'en', 'ru')),
  -- Anonymous random browser ID from the mau_rid cookie. No personal data.
  visitor_id       uuid        NOT NULL,
  opened_at        timestamptz NOT NULL DEFAULT now(),
  last_seen_at     timestamptz NOT NULL DEFAULT now(),
  -- Seconds the tab was visible (the highest value the browser reported).
  engaged_seconds  integer     NOT NULL DEFAULT 0 CHECK (engaged_seconds >= 0),
  -- How far through the article text the reader got, 0–100 %.
  max_scroll       smallint    NOT NULL DEFAULT 0 CHECK (max_scroll BETWEEN 0 AND 100)
);

-- Where the visit came from, on which device, from which country.
-- Added 2026-10; older rows have NULL here. No personal data:
--   source   = a category (facebook, google, direct, internal, …)
--   referrer = only the referring site's name (e.g. "news.google.com") or
--              the utm_source tag — never a full address
--   device   = mobile / tablet / desktop
--   country  = two-letter country code from the hosting provider (no IP stored)
ALTER TABLE stats_opens ADD COLUMN IF NOT EXISTS source   text;
ALTER TABLE stats_opens ADD COLUMN IF NOT EXISTS referrer text;
ALTER TABLE stats_opens ADD COLUMN IF NOT EXISTS device   text;
ALTER TABLE stats_opens ADD COLUMN IF NOT EXISTS country  text;

CREATE INDEX IF NOT EXISTS stats_opens_post_time_idx
  ON stats_opens (content_type, post_id, opened_at);

CREATE INDEX IF NOT EXISTS stats_opens_time_idx
  ON stats_opens (opened_at);

-- Signals we refused (bots, fake tickets, staff devices, …), counted per
-- Tbilisi day, so the owners can see the filter working.
CREATE TABLE IF NOT EXISTS stats_rejections (
  day     date    NOT NULL,
  reason  text    NOT NULL,
  n       integer NOT NULL DEFAULT 0,
  PRIMARY KEY (day, reason)
);
