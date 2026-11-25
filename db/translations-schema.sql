-- db/translations-schema.sql — stored machine translations (English site).
-- Lives in the same Neon database as the reading statistics.
-- Safe to run more than once.

-- One row per translated piece of text (a title, or one paragraph/block
-- of an article). `key` is a fingerprint of the exact Georgian text, so an
-- unchanged paragraph is never sent to the translation service twice, and
-- editing one paragraph only re-translates that paragraph.
CREATE TABLE IF NOT EXISTS mt_segments (
  key         text        PRIMARY KEY,
  source      text        NOT NULL,
  translated  text        NOT NULL,
  chars       integer     NOT NULL,
  provider    text        NOT NULL,
  edited      boolean     NOT NULL DEFAULT false,  -- true = corrected by a person
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Characters sent to the translation service per calendar month (UTC).
-- Checked before every request so the free monthly limit is never passed.
CREATE TABLE IF NOT EXISTS mt_usage (
  month  text   PRIMARY KEY,  -- '2026-11'
  chars  bigint NOT NULL DEFAULT 0
);
