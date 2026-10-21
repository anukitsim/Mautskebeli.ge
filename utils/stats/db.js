// utils/stats/db.js — connection to the statistics database (server only).
//
// The statistics database is separate from WordPress. If STATS_DATABASE_URL
// is not set, statistics are switched off and nothing on the site changes.

import { Pool } from 'pg';

export function isStatsDbConfigured() {
  return Boolean(process.env.STATS_DATABASE_URL);
}

// One pool per server instance (kept on globalThis so dev hot-reload
// doesn't open a new pool on every file change).
function getPool() {
  if (!globalThis.__mauStatsPool) {
    const pool = new Pool({
      connectionString: process.env.STATS_DATABASE_URL,
      max: Number(process.env.STATS_DB_POOL_MAX || 3),
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 5_000,
      query_timeout: 8_000,
    });
    // An idle connection dropped by the database must not crash the server.
    pool.on('error', (err) => {
      console.error('[stats] database pool error:', err.message);
    });
    globalThis.__mauStatsPool = pool;
  }
  return globalThis.__mauStatsPool;
}

export async function statsQuery(text, params = []) {
  const result = await getPool().query(text, params);
  return result.rows;
}
