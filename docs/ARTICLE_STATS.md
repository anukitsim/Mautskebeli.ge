# Article reading statistics — developer guide

Owners-only dashboard at `/admin/stats` that shows, for every article, news
item, free column, translation and book: **ნახვა / views** (every open),
**მკითხველი / readers** (browsers that kept the tab visible 45 s in one sitting
and scrolled at least 25 % of the text) and **საშუალო დრო / average time**,
plus where visits came from (source), device and country.

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
        │                  → ticket signature + age (owners' browsers count too)
        │                  + source (referrer host / utm / fbclid), device (UA), country (x-vercel-ip-country)
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
| `utils/stats/audience.js` | source / device / country classification and labels |
| `app/(root)/api/auth/[...nextauth]/route.js` | login (NextAuth v4) |
| `app/admin/**` | dashboard |
| `app/all-articles/[id]/{page,ENG/page,RU/page}.jsx` | tracker added (3 lines each) |
| `scripts/stats-migrate.mjs` | `npm run stats:migrate` |
| `scripts/stats-e2e-test.js` | `npm run stats:test` (local only, deletes data) |

## Environment variables

| Name | Where | Value |
|---|---|---|
| `STATS_DATABASE_URL` | Vercel **Production** | Neon **pooled** connection string — or let the Vercel Neon integration create `STATS_DATABASE_DATABASE_URL` (custom prefix `STATS_DATABASE`), which the code also reads |
| `STATS_SECRET` | Production | `openssl rand -base64 48` |
| `NEXTAUTH_SECRET` | Production | `openssl rand -base64 48` (different!) |
| `NEXTAUTH_URL` | Production | `https://www.mautskebeli.ge` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Production | from Google Cloud (below) |
| `STATS_ADMIN_EMAILS` | Production | `owner1@gmail.com,owner2@gmail.com` |
| `STATS_COOKIE_DOMAIN` | Production | `mautskebeli.ge` — cookies cover both `mautskebeli.ge` and `www.` (the site answers on both; `/admin` and `/api/auth` are redirected to www in `next.config.js`) |
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
   - refused signals (bots, fake tickets, floods) are counted per day in the
     `stats_rejections` table (no dashboard page; query it directly).
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

## Adding another content type

Add it to `utils/stats/content-types.js` (and to the `content_type` CHECK in
`db/stats-schema.sql`), create a ticket in its detail page
(`createReadingTicket({ type, postId, lang })`) and render
`<ReadingTracker ticket={…} contentSelector="…" />`. The dashboard tab appears by itself.

## Known limits

- One person on two devices = two readers; private windows / cleared cookies = new reader.
- Readers who block JavaScript, or whose blocker blocks `/api/reading`, are not counted.
- The flood guard is per server instance (in memory), not global.
- Counting starts on launch day (2026-10-22); there is no history before that.
  Source / device / country start when that feature was deployed; older rows show as "unknown".
- Source: messengers (Messenger, Viber, WhatsApp) and typed/bookmarked addresses send no
  referrer and appear as "direct". Browsers send only the referring site's name, never the page.
- Country comes from the reader's connection (VPNs show the VPN's country).
- **Schema change in this version:** run `npm run stats:migrate` against the production
  database *before* deploying (adds the nullable source/referrer/device/country columns).
