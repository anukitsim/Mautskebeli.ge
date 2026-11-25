// utils/translate/index.js — English versions of WordPress content (server only).
//
// How it works, for one page:
//   1. Titles are kept whole; article HTML is cut into blocks (paragraphs,
//      headings, quotes, lists). Blocks without Georgian letters (images,
//      embeds) are kept as they are and cost nothing.
//   2. Each piece gets a fingerprint of its exact Georgian text. Pieces we
//      translated before come from the database.
//   3. Only new or changed pieces go to the translation service, in small
//      batches, and only while this month's free allowance has room.
//   4. Every finished batch is saved at once. If time runs out (a page
//      must not hang), the rest stays Georgian for now and `complete` is
//      false; the next visit continues where this one stopped.
//
// Nothing here ever throws to the page: on any problem the Georgian
// original is returned and `complete` is false.

import crypto from 'node:crypto';
import { load } from 'cheerio';
import { MAX_BATCH_CHARS, MAX_BATCH_ITEMS, providerName, translateBatch } from './provider';
import { getSegments, releaseChars, reserveChars, saveSegments } from './store';

const GEORGIAN = /[ა-ჿᲐ-Ჿ]/;
const MONTHLY_LIMIT = Number(process.env.MT_MONTHLY_CHAR_LIMIT || 1_900_000);
const DEFAULT_DEADLINE_MS = Number(process.env.MT_DEADLINE_MS || 7_000);
const BIG_BLOCK = 8_000; // blocks longer than this are split into their children
const PARALLEL = 3;

const BLOCK_TAGS = new Set([
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'figure',
  'figcaption', 'div', 'section', 'article', 'table', 'thead', 'tbody', 'tr', 'td', 'th',
  'pre', 'hr', 'br', 'iframe', 'video', 'audio',
]);

export function isMachineTranslationOn() {
  return Boolean(providerName());
}

function fingerprint(kind, source) {
  return crypto.createHash('sha256').update(`ka>en|${kind}|${source}`).digest('hex');
}

function openTag(node) {
  const attrs = Object.entries(node.attribs || {})
    .map(([k, v]) => ` ${k}="${String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`)
    .join('');
  return `<${node.name}${attrs}>`;
}

// HTML → [{ text, translate }] — joined back together it is the same HTML.
export function splitHtml(html) {
  const $ = load(html || '', null, false);
  const parts = [];
  let inline = '';

  const flushInline = () => {
    if (inline) parts.push({ text: inline, translate: GEORGIAN.test(inline) });
    inline = '';
  };

  const walk = (nodes) => {
    for (const node of nodes) {
      const isBlock = node.type === 'tag' && BLOCK_TAGS.has(node.name);
      if (!isBlock) {
        inline += $.html(node);
        continue;
      }
      flushInline();
      const outer = $.html(node);
      const children = node.children || [];
      if (outer.length > BIG_BLOCK && children.length > 1) {
        parts.push({ text: openTag(node), translate: false });
        walk(children);
        flushInline();
        parts.push({ text: `</${node.name}>`, translate: false });
      } else {
        parts.push({ text: outer, translate: GEORGIAN.test(outer) });
      }
    }
  };

  walk($.root().contents().toArray());
  flushInline();
  return parts;
}

// units: [{ kind: 'text' | 'html', source }] → translated strings (or null)
async function translateUnits(units, deadline) {
  const results = new Array(units.length).fill(null);
  const keys = units.map((u) => fingerprint(u.kind, u.source));

  let stored;
  try {
    stored = await getSegments([...new Set(keys)]);
  } catch (err) {
    console.error('[translate] could not read stored translations:', err.message);
    return { results, complete: false };
  }
  keys.forEach((k, i) => { if (stored.has(k)) results[i] = stored.get(k); });

  // Still missing, without duplicates, grouped into batches per kind.
  const missing = new Map();
  keys.forEach((k, i) => { if (results[i] === null && !missing.has(k)) missing.set(k, units[i]); });
  if (!missing.size) return { results, complete: true };
  if (!isMachineTranslationOn()) return { results, complete: false };

  const batches = [];
  for (const kind of ['text', 'html']) {
    let batch = [];
    let size = 0;
    for (const [key, unit] of missing) {
      if (unit.kind !== kind) continue;
      if (batch.length && (size + unit.source.length > MAX_BATCH_CHARS || batch.length >= MAX_BATCH_ITEMS)) {
        batches.push({ kind, items: batch, size });
        batch = [];
        size = 0;
      }
      batch.push({ key, source: unit.source });
      size += unit.source.length;
    }
    if (batch.length) batches.push({ kind, items: batch, size });
  }

  const done = new Map();
  let allDone = true;

  const runBatch = async (batch) => {
    if (Date.now() > deadline) { allDone = false; return; }
    if (!(await reserveChars(batch.size, MONTHLY_LIMIT))) {
      console.warn(`[translate] monthly limit reached, ${batch.size} characters left in Georgian`);
      allDone = false;
      return;
    }
    try {
      const out = await translateBatch(batch.items.map((i) => i.source), { html: batch.kind === 'html' });
      const rows = batch.items.map((item, i) => ({
        key: item.key,
        source: item.source,
        translated: out[i] || '',
        chars: item.source.length,
        provider: providerName(),
      })).filter((r) => r.translated);
      rows.forEach((r) => done.set(r.key, r.translated));
      if (rows.length < batch.items.length) allDone = false;
      await saveSegments(rows);
    } catch (err) {
      await releaseChars(batch.size).catch(() => {});
      console.error('[translate] batch failed:', err.message);
      allDone = false;
    }
  };

  // A few batches at a time, so a long article finishes quickly.
  for (let i = 0; i < batches.length; i += PARALLEL) {
    await Promise.all(batches.slice(i, i + PARALLEL).map(runBatch));
  }

  keys.forEach((k, i) => { if (results[i] === null && done.has(k)) results[i] = done.get(k); });
  return { results, complete: allDone && results.every((r) => r !== null) };
}

/**
 * Translate a page's content in one go.
 *   const { text, html, complete } = await translateContent({
 *     text: { title, author },          // plain strings
 *     html: { body: article.content },  // HTML
 *   });
 * Missing translations come back as the Georgian original.
 */
export async function translateContent({ text = {}, html = {} } = {}, { deadlineMs = DEFAULT_DEADLINE_MS } = {}) {
  const deadline = Date.now() + deadlineMs;
  const units = [];
  const plan = { text: {}, html: {} };

  for (const [name, value] of Object.entries(text)) {
    if (typeof value === 'string' && GEORGIAN.test(value)) {
      plan.text[name] = units.length;
      units.push({ kind: 'text', source: value.trim() });
    }
  }
  for (const [name, value] of Object.entries(html)) {
    if (typeof value !== 'string' || !GEORGIAN.test(value)) continue;
    const parts = splitHtml(value);
    plan.html[name] = parts.map((p) => {
      if (!p.translate) return { glue: p.text };
      units.push({ kind: 'html', source: p.text });
      return { unit: units.length - 1, original: p.text };
    });
  }

  let results = [];
  let complete = true;
  if (units.length) {
    try {
      ({ results, complete } = await translateUnits(units, deadline));
    } catch (err) {
      console.error('[translate] failed:', err.message);
      results = new Array(units.length).fill(null);
      complete = false;
    }
  }

  const outText = {};
  for (const [name, value] of Object.entries(text)) {
    const i = plan.text[name];
    outText[name] = i === undefined ? value : (results[i] ?? value);
  }
  const outHtml = {};
  for (const [name, value] of Object.entries(html)) {
    const parts = plan.html[name];
    outHtml[name] = parts
      ? parts.map((p) => (p.glue !== undefined ? p.glue : (results[p.unit] ?? p.original))).join('')
      : value;
  }
  return { text: outText, html: outHtml, complete };
}

// Short helper for lists: many titles at once → translated titles.
export async function translateTitles(titles, options) {
  const text = {};
  titles.forEach((t, i) => { text[i] = t; });
  const { text: out, complete } = await translateContent({ text }, options);
  return { titles: titles.map((t, i) => out[i] ?? t), complete };
}
