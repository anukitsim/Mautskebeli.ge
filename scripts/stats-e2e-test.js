// scripts/stats-e2e-test.js — end-to-end tests for article reading statistics.
//
// LOCAL ONLY: it deletes all rows in the statistics tables before running.
// Needs: the site running in dev mode with stats + dev login switched on
// (STATS_DEV_LOGIN=1, STATS_ADMIN_EMAILS containing owner@example.com),
// a local Postgres, and Google Chrome.
//
// Usage:
//   STATS_DATABASE_URL=postgres://...@127.0.0.1:.../... \
//   BASE_URL=http://localhost:3100 node scripts/stats-e2e-test.js [--skip-slow]

const puppeteer = require('puppeteer');
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const BASE = process.env.BASE_URL || 'http://localhost:3100';
const DB_URL = process.env.STATS_DATABASE_URL || '';
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SLUG = process.env.TEST_ARTICLE_SLUG || 'tskhovreba-emigratsiashi-shroma-kveqnistvis';
const POST = Number(process.env.TEST_ARTICLE_ID || 5089);
const SKIP_SLOW = process.argv.includes('--skip-slow');

if (!/@(127\.0\.0\.1|localhost)[:/]/.test(DB_URL) || !/^http:\/\/localhost/.test(BASE)) {
  console.error('Refusing to run: this test deletes data and only runs against a LOCAL database and site.');
  process.exit(1);
}

const db = new Client({ connectionString: DB_URL });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
async function newPage(ctx) { const p = await ctx.newPage(); await p.setUserAgent(UA); return p; }
function check(name, ok, detail = '') {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}
async function q(sql, params) {
  return (await db.query(sql, params)).rows;
}
const opens = () => q('SELECT * FROM stats_opens ORDER BY opened_at');
const rejections = async () =>
  Object.fromEntries((await q('SELECT reason, sum(n)::int n FROM stats_rejections GROUP BY reason')).map((r) => [r.reason, r.n]));

async function openArticle(ctx, path, waitMs = 2500) {
  const page = await newPage(ctx);
  await page.goto(BASE + path, { waitUntil: 'networkidle2', timeout: 120000 });
  await sleep(waitMs);
  return page;
}
async function getTicket(page) {
  // Read the ticket the server put in the page (from the RSC payload).
  const html = await page.content();
  const m = html.match(/ticket\\":\\"([A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+)\\"/);
  return m && m[1];
}

(async () => {
  await db.connect();
  await q('TRUNCATE stats_opens, stats_rejections');
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--user-agent=' + UA] });

  // 1. A new reader opens an article once.
  const reader = await browser.createBrowserContext();
  let page = await openArticle(reader, `/all-articles/${SLUG}`);
  let rows = await opens();
  check('1 open → 1 row', rows.length === 1, `rows=${rows.length}`);
  check('row is article 5089, Georgian', rows[0]?.post_id === POST && rows[0]?.lang === 'ka' && rows[0]?.content_type === 'article');
  const cookies = await page.cookies();
  const rid = cookies.find((c) => c.name === 'mau_rid');
  check('anonymous reader cookie set by server (HttpOnly)', Boolean(rid?.httpOnly), rid ? `expires in ${Math.round((rid.expires * 1000 - Date.now()) / 86400000)} days` : 'missing');
  check('row uses that same reader ID', rows[0]?.visitor_id === rid?.value);
  const ticket = await getTicket(page);
  check('page carries a signed ticket', Boolean(ticket));

  // 2. Same reader reloads → 2 views, still 1 reader.
  await page.reload({ waitUntil: 'networkidle2' });
  await sleep(2500);
  rows = await opens();
  check('reload → 2 views', rows.length === 2);
  check('reload → still 1 reader', new Set(rows.map((r) => r.visitor_id)).size === 1);

  // 3. Same article at other addresses → counted as the same post.
  await page.goto(`${BASE}/all-articles/${POST}`, { waitUntil: 'networkidle2' });
  await sleep(2500);
  await page.goto(`${BASE}/all-articles/${SLUG}?fbclid=test123`, { waitUntil: 'networkidle2' });
  await sleep(2500);
  rows = await opens();
  check('/all-articles/5089 and ?fbclid= → same article', rows.length === 4 && rows.every((r) => r.post_id === POST), `rows=${rows.length}`);

  // 4. English version → language "en", same post.
  await page.goto(`${BASE}/all-articles/${SLUG}/ENG`, { waitUntil: 'networkidle2' });
  await sleep(2500);
  rows = await opens();
  check('/ENG → language en, same article', rows.at(-1)?.lang === 'en' && rows.at(-1)?.post_id === POST);
  await page.close();

  // 5. Clicking from the article list → exactly one new open (no double counting).
  const clicker = await browser.createBrowserContext();
  const list = await newPage(clicker);
  await list.goto(`${BASE}/all-articles`, { waitUntil: 'networkidle2', timeout: 120000 });
  const before = (await opens()).length;
  const clicked = await list.evaluate((slug) => {
    const a = [...document.querySelectorAll('a')].find((x) => x.getAttribute('href') === `/all-articles/${slug}`);
    if (a) a.click();
    return Boolean(a);
  }, SLUG);
  await sleep(6000);
  const after = (await opens()).length;
  check('click from list → exactly 1 new open', clicked && after - before === 1, `clicked=${clicked} new=${after - before}`);
  await list.close();

  // 6. Bot → nothing counted.
  const botCtx = await browser.createBrowserContext();
  const bot = await botCtx.newPage();
  await bot.setUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)');
  const nBefore = (await opens()).length;
  await bot.goto(`${BASE}/all-articles/${SLUG}`, { waitUntil: 'networkidle2' });
  await sleep(2500);
  check('Googlebot → not counted', (await opens()).length === nBefore);
  check('Googlebot → logged as "bot"', (await rejections()).bot >= 1);

  // 7. Fake ticket / forged signals sent by hand from a page.
  const att = await browser.createBrowserContext();
  const ap = await openArticle(att, `/all-articles/${SLUG}`);
  const goodTicket = await getTicket(ap);
  const send = (body) =>
    ap.evaluate(async (b) => (await fetch('/api/reading', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) })).status, body);
  const n7 = (await opens()).length;
  const forged = goodTicket.slice(0, -4) + 'AAAA';
  await send({ ticket: forged, openId: '11111111-1111-4111-8111-111111111111', seconds: 0, scroll: 0 });
  check('forged ticket → refused', (await opens()).length === n7 && (await rejections()).bad_ticket >= 1);

  // 8. Claiming 999 seconds right after opening → capped to real time.
  const cheatId = '22222222-2222-4222-8222-222222222222';
  await send({ ticket: goodTicket, openId: cheatId, seconds: 0, scroll: 0 });
  await send({ ticket: goodTicket, openId: cheatId, seconds: 999, scroll: 100 });
  const [cheat] = await q('SELECT engaged_seconds FROM stats_opens WHERE open_id = $1', [cheatId]);
  check('fake 999 s → capped to real time', cheat && cheat.engaged_seconds <= 30, `stored=${cheat?.engaged_seconds}s`);

  // 9. Reusing an open ID for a different language/article → refused.
  await ap.goto(`${BASE}/all-articles/${SLUG}/RU`, { waitUntil: 'networkidle2' });
  await sleep(1500);
  const ruTicket = await getTicket(ap);
  await send({ ticket: ruTicket, openId: cheatId, seconds: 5, scroll: 5 });
  check('open ID reused for other version → refused ("mismatch")', (await rejections()).mismatch >= 1);
  check('/RU → language ru', (await opens()).some((r) => r.lang === 'ru'));

  // 10. Flood: 80 signals in a minute from one address → cut off after 60.
  const flood = await ap.evaluate(async () => {
    const statuses = [];
    for (let i = 0; i < 80; i++) {
      statuses.push((await fetch('/api/reading', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status);
    }
    return statuses.length;
  });
  check('flood → logged once as "rate_limited"', flood === 80 && (await rejections()).rate_limited === 1);

  // 11. Owner logged in → their device is not counted.
  await sleep(61000 - (Date.now() % 60000)); // wait for a fresh rate-limit minute
  const owner = await browser.createBrowserContext();
  const op = await newPage(owner);
  await op.goto(`${BASE}/admin/login`, { waitUntil: 'networkidle2', timeout: 120000 });
  await op.type('input[type=email]', 'owner@example.com');
  await Promise.all([op.waitForNavigation({ waitUntil: 'networkidle2', timeout: 120000 }), op.click('form button[type=submit]')]);
  check('owner login → dashboard', op.url().includes('/admin/stats'), op.url());
  await sleep(2000);
  const staff = (await op.cookies()).find((c) => c.name === 'mau_staff');
  check('owner device marked', Boolean(staff));
  const n11 = (await opens()).length;
  await op.goto(`${BASE}/all-articles/${SLUG}`, { waitUntil: 'networkidle2' });
  await sleep(2500);
  check('owner reading → not counted ("staff")', (await opens()).length === n11 && (await rejections()).staff >= 1);

  // 12. Not on the list → no access.
  const stranger = await browser.createBrowserContext();
  const sp = await newPage(stranger);
  await sp.goto(`${BASE}/admin/stats`, { waitUntil: 'networkidle2' });
  check('not logged in → sent to login', sp.url().includes('/admin/login'));
  await sp.type('input[type=email]', 'someone@else.com');
  await Promise.all([sp.waitForNavigation({ waitUntil: 'networkidle2' }), sp.click('form button[type=submit]')]);
  await sleep(1000);
  const deniedText = await sp.evaluate(() => document.body.innerText);
  check('wrong email → refused', sp.url().includes('/admin/login') && /წვდომა არ აქვს/.test(deniedText), sp.url());
  const apiStatus = await sp.evaluate(async () => (await fetch('/api/reading/staff', { method: 'POST' })).status);
  check('stranger cannot mark device as staff', apiStatus === 401);

  if (!SKIP_SLOW) {
    // 13. Short visit (10 s) → a view, not a real read.
    const shortCtx = await browser.createBrowserContext();
    const shortP = await openArticle(shortCtx, `/all-articles/${SLUG}`, 2000);
    const shortVid = (await shortP.cookies()).find((c) => c.name === 'mau_rid')?.value;
    await sleep(8000);
    await shortP.goto('about:blank');
    await sleep(1500);
    const [shortRow] = await q('SELECT * FROM stats_opens WHERE visitor_id = $1', [shortVid]);
    check('8 s visit → counted with ~8 s, not a read', shortRow && shortRow.engaged_seconds >= 6 && shortRow.engaged_seconds < 45, `seconds=${shortRow?.engaged_seconds} scroll=${shortRow?.max_scroll}%`);

    // 14. Real read: scroll ~40% and stay 47 s.
    const readCtx = await browser.createBrowserContext();
    const rp = await openArticle(readCtx, `/all-articles/${SLUG}`, 2000);
    const readVid = (await rp.cookies()).find((c) => c.name === 'mau_rid')?.value;
    await rp.evaluate(() => {
      const el = document.querySelector('.article-content');
      const r = el.getBoundingClientRect();
      window.scrollTo(0, window.scrollY + r.top + r.height * 0.4 - window.innerHeight);
    });
    await sleep(47000);
    const [readRow] = await q('SELECT * FROM stats_opens WHERE visitor_id = $1', [readVid]);
    check('45 s + scrolled → real read', readRow && readRow.engaged_seconds >= 45 && readRow.max_scroll >= 25, `seconds=${readRow?.engaged_seconds} scroll=${readRow?.max_scroll}%`);
    check('scroll ~40% measured correctly', readRow && readRow.max_scroll >= 35 && readRow.max_scroll <= 45, `scroll=${readRow?.max_scroll}%`);
  }

  // 15. The other content types: each page counts under its own type and number.
  const OTHER = [
    { type: 'news', post: 5078, path: '/news/istoria-romelsats-ver-tsashli-chile-11', body: '[data-reading-body]' },
    { type: 'free-column', post: 4964, path: '/free-column/4964', body: '.article-content' },
    { type: 'translate', post: 4840, path: '/translate/atomuri-omi-da-katsobriobis-dasasruli', body: '.article-content' },
    { type: 'book', post: 474, path: '/books/474', body: '[data-reading-body]' },
  ];
  for (const t of OTHER) {
    const ctx = await browser.createBrowserContext();
    const p = await openArticle(ctx, t.path, 3000);
    const vid = (await p.cookies()).find((c) => c.name === 'mau_rid')?.value;
    if (!SKIP_SLOW) {
      // Scroll half-way through the text, then wait past the 15 s update.
      await p.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return;
        const r = el.getBoundingClientRect();
        window.scrollTo(0, window.scrollY + r.top + r.height * 0.5 - window.innerHeight);
      }, t.body);
      await sleep(15000);
    }
    const rows = await q('SELECT * FROM stats_opens WHERE visitor_id = $1', [vid]);
    check(`${t.type}: 1 open → 1 row, type "${t.type}", number ${t.post}`,
      rows.length === 1 && rows[0].content_type === t.type && rows[0].post_id === t.post && rows[0].lang === 'ka',
      `rows=${rows.length} ${rows[0]?.content_type}/${rows[0]?.post_id}`);
    if (!SKIP_SLOW) {
      check(`${t.type}: time and scroll measured`, rows[0]?.engaged_seconds >= 15 && rows[0]?.max_scroll >= 40 && rows[0]?.max_scroll <= 60,
        `seconds=${rows[0]?.engaged_seconds} scroll=${rows[0]?.max_scroll}%`);
    }
    await ctx.close();
  }

  // Final: every dashboard page must show exactly what the database holds.
  const COUNT_SQL = `count(*)::int views, count(DISTINCT visitor_id)::int readers,
    count(DISTINCT (visitor_id, content_type, post_id)) FILTER (WHERE engaged_seconds >= 45 AND max_scroll >= 25)::int reads`;
  const tilesOf = async (path) => {
    await op.goto(`${BASE}${path}`, { waitUntil: 'networkidle2' });
    return op.$$eval('.tile-value', (els) => els.slice(0, 3).map((e) => e.textContent.replace(/\s/g, '')));
  };
  const same = (tiles, e) => tiles[0] === String(e.views) && tiles[1] === String(e.readers) && tiles[2] === String(e.reads);

  const [site] = await q(`SELECT ${COUNT_SQL} FROM stats_opens`);
  let tiles = await tilesOf('/admin/stats?period=all');
  check('overview = database (all content)', same(tiles, site), `db=${site.views}/${site.readers}/${site.reads} page=${tiles.join('/')}`);

  for (const type of ['article', 'news', 'free-column', 'translate', 'book']) {
    const [e] = await q(`SELECT ${COUNT_SQL} FROM stats_opens WHERE content_type = $1`, [type]);
    tiles = await tilesOf(`/admin/stats/${type}?period=all`);
    check(`${type} list = database`, same(tiles, e), `db=${e.views}/${e.readers}/${e.reads} page=${tiles.join('/')}`);
  }

  const [item] = await q(`SELECT ${COUNT_SQL} FROM stats_opens WHERE content_type = 'article' AND post_id = $1`, [POST]);
  tiles = await tilesOf(`/admin/stats/article/${POST}?period=all`);
  check('article detail = database', same(tiles, item), `db=${item.views}/${item.readers}/${item.reads} page=${tiles.join('/')}`);

  await browser.close();
  await db.end();
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch(async (e) => {
  console.error('TEST CRASH:', e);
  process.exit(2);
});
