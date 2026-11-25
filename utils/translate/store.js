// utils/translate/store.js — where finished translations are kept (server only).
//
// Production: the Neon database (tables in db/translations-schema.sql).
// No database configured (local development): kept in memory instead, so
// everything still works while testing; it is forgotten on restart.

import { isStatsDbConfigured, statsQuery } from '../stats/db';

const memory = globalThis.__mauMtMemory || (globalThis.__mauMtMemory = { segments: new Map(), usage: new Map() });

function useDb() {
  return isStatsDbConfigured();
}

// The two tables (db/translations-schema.sql) are created on first use,
// once per server instance. Only CREATE TABLE IF NOT EXISTS: it never
// changes or removes anything that exists.
let schemaReady = null;
function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await statsQuery(`CREATE TABLE IF NOT EXISTS mt_segments (
        key text PRIMARY KEY, source text NOT NULL, translated text NOT NULL,
        chars integer NOT NULL, provider text NOT NULL,
        edited boolean NOT NULL DEFAULT false,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now())`);
      await statsQuery(`CREATE TABLE IF NOT EXISTS mt_usage (
        month text PRIMARY KEY, chars bigint NOT NULL DEFAULT 0)`);
    })().catch((err) => {
      schemaReady = null; // try again next time
      throw err;
    });
  }
  return schemaReady;
}

async function query(text, params) {
  await ensureSchema();
  return statsQuery(text, params);
}

// keys → Map(key → translated text)
export async function getSegments(keys) {
  const found = new Map();
  if (!keys.length) return found;
  if (!useDb()) {
    for (const k of keys) if (memory.segments.has(k)) found.set(k, memory.segments.get(k));
    return found;
  }
  const rows = await query('SELECT key, translated FROM mt_segments WHERE key = ANY($1)', [keys]);
  for (const r of rows) found.set(r.key, r.translated);
  return found;
}

// rows: [{ key, source, translated, chars, provider }]
// A row a person has corrected (edited = true) is never overwritten.
export async function saveSegments(rows) {
  if (!rows.length) return;
  if (!useDb()) {
    for (const r of rows) memory.segments.set(r.key, r.translated);
    return;
  }
  const values = [];
  const params = [];
  rows.forEach((r, i) => {
    const o = i * 5;
    values.push(`($${o + 1}, $${o + 2}, $${o + 3}, $${o + 4}, $${o + 5})`);
    params.push(r.key, r.source, r.translated, r.chars, r.provider);
  });
  await query(
    `INSERT INTO mt_segments (key, source, translated, chars, provider)
     VALUES ${values.join(', ')}
     ON CONFLICT (key) DO UPDATE
       SET translated = EXCLUDED.translated, provider = EXCLUDED.provider, updated_at = now()
       WHERE mt_segments.edited = false`,
    params
  );
}

function monthKey() {
  return new Date().toISOString().slice(0, 7);
}

// Reserve `chars` from this month's allowance. Returns true if it fits.
// Done in one database statement, so two pages translating at the same
// moment can't both squeeze past the limit.
export async function reserveChars(chars, limit) {
  const month = monthKey();
  if (!useDb()) {
    const used = memory.usage.get(month) || 0;
    if (used + chars > limit) return false;
    memory.usage.set(month, used + chars);
    return true;
  }
  await query('INSERT INTO mt_usage (month, chars) VALUES ($1, 0) ON CONFLICT (month) DO NOTHING', [month]);
  const rows = await query(
    'UPDATE mt_usage SET chars = chars + $2 WHERE month = $1 AND chars + $2 <= $3 RETURNING chars',
    [month, chars, limit]
  );
  return rows.length > 0;
}

// Give back an allowance that was reserved but not used (request failed).
export async function releaseChars(chars) {
  const month = monthKey();
  if (!useDb()) {
    memory.usage.set(month, Math.max(0, (memory.usage.get(month) || 0) - chars));
    return;
  }
  await query('UPDATE mt_usage SET chars = GREATEST(0, chars - $2) WHERE month = $1', [month, chars]);
}

export async function usageThisMonth() {
  const month = monthKey();
  if (!useDb()) return memory.usage.get(month) || 0;
  const rows = await query('SELECT chars FROM mt_usage WHERE month = $1', [month]);
  return rows.length ? Number(rows[0].chars) : 0;
}
