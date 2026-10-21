# Article reading statistics — developer guide

Owners-only dashboard at `/admin/stats` that shows, for every article:
**views** (every open), **readers** (different browsers) and **real reads**
(tab visible 45 s in one sitting + at least 25 % of the text scrolled).

Counting is done by our own code and our own Postgres database. WordPress is
only read for article titles.

## Safe by default

Everything is **switched off** until `STATS_DATABASE_URL` and `STATS_SECRET`
(≥ 32 characters) are set. While off:

- article pages render exactly as before (no tracker, `ticket: null`);
- `/api/reading` answers `204` and touches nothing;
- `/api/auth/*` answers `404`;
- `/admin/*` shows "not switched on".

**Instant rollback:** delete `STATS_SECRET` in Vercel and redeploy. No code revert.

## How it works

```
article page (server)  ── makes a signed ticket: {article 5089, "ka", time}
        │
reader's browser       ── ReadingTracker: "opened" + updates at 15/45/90/180/300/600 s
        │                  (visible time only) + one last update when leaving
        ▼
POST /api/reading      ── flood guard → same-origin → size → not a bot (isbot)
        │                  → ticket signature + age → not a staff device
        ▼
stats_opens            ── 1 row per open (browser-made open_id), upserted:
                          highest seconds / scroll win, capped by real elapsed time
        ▼
/admin/stats           ── Google login, email allow-list, numbers computed from rows
```

Definitions live in [utils/stats/queries.js](../utils/stats/queries.js) and the
rule in [utils/stats/config.js](../utils/stats/config.js). Because raw seconds and
scroll % are stored, changing the rule recalculates all past data.

## Files

| Path | What |
|---|---|
| `db/stats-schema.sql` | tables `stats_opens`, `stats_rejections` |
| `utils/stats/*` | config, db pool, tickets, auth, queries, WordPress titles |
| `app/components/ReadingTracker.jsx` | the browser part |
| `app/(root)/api/reading/route.js` | receives signals |
| `app/(root)/api/reading/staff/route.js` | marks an owner's device |
| `app/(root)/api/auth/[...nextauth]/route.js` | login (NextAuth v4) |
| `app/admin/**` | dashboard |
| `app/all-articles/[id]/{page,ENG/page,RU/page}.jsx` | tracker added (3 lines each) |
| `scripts/stats-migrate.mjs` | `npm run stats:migrate` |
| `scripts/stats-e2e-test.js` | `npm run stats:test` (local only, deletes data) |

## Environment variables

| Name | Where | Value |
|---|---|---|
| `STATS_DATABASE_URL` | Vercel **Production** | Neon **pooled** connection string |
| `STATS_SECRET` | Production | `openssl rand -base64 48` |
| `NEXTAUTH_SECRET` | Production | `openssl rand -base64 48` (different!) |
| `NEXTAUTH_URL` | Production | `https://www.mautskebeli.ge` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Production | from Google Cloud (below) |
| `STATS_ADMIN_EMAILS` | Production | `owner1@gmail.com,owner2@gmail.com` |
| `STATS_DEV_LOGIN` | **never in Vercel** | `1` only in local `.env.local` |

Leave them unset in **Preview** (stats off there), or use a separate Neon branch.

## Going live (in order)

1. **Check Vercel usage.** Each article open costs about 2–4 function calls.
   Hobby includes 1,000,000 calls / month for the whole site.
2. **Create the database:** Vercel → Storage → Neon (Marketplace), region
   **US East (Washington)** — the site's functions run in `iad1`.
   Copy the *pooled* connection string into `STATS_DATABASE_URL`.
3. **Create tables:** locally, `STATS_DATABASE_URL=<neon url> npm run stats:migrate`.
4. **Google login:** Google Cloud Console → APIs & Services → Credentials →
   Create OAuth client ID → *Web application*.
   Authorized redirect URI: `https://www.mautskebeli.ge/api/auth/callback/google`.
5. **Set the env vars** above in Vercel (Production only).
6. **Merge and deploy.**
7. **Verify on the live site:**
   - open an article in a private window → `/admin/stats` shows +1 view, +1 reader;
   - stay 45 s and scroll a quarter → +1 real read;
   - an email not on the list cannot log in;
   - `/admin/stats/health` shows rejections (bots appear within hours).
8. **Back up:** Neon free keeps 6 hours of history. Add a nightly `pg_dump`
   (e.g. GitHub Action) or use a paid Neon plan before relying on old data.

## Local development

Use **Node 22** (Node 23 breaks `next build` for this Next 14 project — the
untouched `main` fails too). Any local Postgres works; one with nothing to
install:

```bash
npx -p @electric-sql/pglite-socket pglite-server --db=./.stats-db --port=55432 --max-connections=4
```

`.env.local`:

```
STATS_DATABASE_URL=postgres://postgres:postgres@127.0.0.1:55432/postgres
STATS_DB_POOL_MAX=1
STATS_SECRET=<48 random chars>
NEXTAUTH_SECRET=<48 random chars>
NEXTAUTH_URL=http://localhost:3100
STATS_ADMIN_EMAILS=owner@example.com
STATS_DEV_LOGIN=1
```

Then `npm run stats:migrate`, `npx next dev -p 3100`, log in at `/admin/login`
with `owner@example.com`, and run `npm run stats:test`.

## Adding other content types

`news`, `free-column`, `translate` and `book` are already allowed by the
database. For each: create a ticket in its detail page
(`createReadingTicket({ type: 'news', postId, lang })`), render
`<ReadingTracker ticket={…} contentSelector="…" />`, and add a dashboard tab
that calls the same queries with that type.

## Known limits

- One person on two devices = two readers; private windows / cleared cookies = new reader.
- Readers who block JavaScript, or whose blocker blocks `/api/reading`, are not counted.
- The flood guard is per server instance (in memory), not global.
- Counting starts on launch day; there is no history before that.
