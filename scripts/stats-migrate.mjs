// scripts/stats-migrate.mjs — creates the statistics tables (safe to re-run).
// Usage: STATS_DATABASE_URL=postgres://... npm run stats:migrate
//   (or put STATS_DATABASE_URL in .env.local)

import { readFile } from 'node:fs/promises';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const url = process.env.STATS_DATABASE_URL;
if (!url) {
  console.error('STATS_DATABASE_URL is not set.');
  process.exit(1);
}

const sql = await readFile(new URL('../db/stats-schema.sql', import.meta.url), 'utf8');
const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  await client.query(sql);
  const { rows } = await client.query(
    `SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'stats_%' ORDER BY 1`
  );
  console.log('OK — tables:', rows.map((r) => r.table_name).join(', '));
} finally {
  await client.end();
}
