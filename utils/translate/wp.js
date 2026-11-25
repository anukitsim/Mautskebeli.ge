// utils/translate/wp.js — English version of a WordPress REST response
// (server only). Used by /api/en/wp/... (browser components) and by server
// components that fetch WordPress themselves.
//
// Translated: title, excerpt, content and the ACF text fields of each post.
// Not touched: addresses, images, video ids, numbers, dates, slugs.
// Lists (more than one post): long texts are translated only at the start
// (enough for card previews), the rest stays as is, so a list page costs
// little. Opening one post translates everything.

import { translateContent } from './index';

const GEORGIAN = /[ა-ჿ]/;
const SKIP_KEY = /(^|_)(url|link|links|video|videos|youtube|image|images|img|photo|pdf|file|slug|id|ids|date|embed|iframe|playlist|thumbnail|thumb|src|email|phone)(_|$)/i;
const LIST_PREVIEW_CHARS = 800;
const SHORT = 1000;

// The first blocks of an HTML text, about `limit` characters, cut between
// blocks so no tag is broken; returns [head, rest].
function splitPreview(html, limit) {
  const re = /<\/(p|h[1-6]|blockquote|ul|ol|figure|div)>/gi;
  let m;
  let cut = -1;
  while ((m = re.exec(html))) {
    cut = m.index + m[0].length;
    if (cut >= limit) break;
  }
  if (cut <= 0 || cut >= html.length) {
    if (html.length <= limit * 1.5) return [html, ''];
    // No paragraph tags (plain text): cut after a sentence near the limit,
    // outside any tag.
    const re2 = /[.!?…]["»“”]?\s+/g;
    let m2;
    let cut2 = -1;
    while ((m2 = re2.exec(html))) {
      const at = m2.index + m2[0].length;
      if (html.lastIndexOf('<', at) > html.lastIndexOf('>', at)) continue; // inside a tag
      cut2 = at;
      if (at >= limit) break;
    }
    return cut2 > 0 && cut2 < html.length ? [html.slice(0, cut2), html.slice(cut2)] : ['', html];
  }
  return [html.slice(0, cut), html.slice(cut)];
}

function isPost(value) {
  return value && typeof value === 'object' && !Array.isArray(value) && ('title' in value || 'acf' in value) && ('id' in value || 'slug' in value || 'post_id' in value || 'ID' in value);
}

/**
 * data: a WordPress REST response (one post, a list of posts, or anything
 * else, which is returned unchanged). Returns { data, complete }.
 */
// Posts in the response: a list, one post, or a list inside a wrapper
// object (custom endpoints answer e.g. { news: [...], total_pages: 3 }).
function findPosts(data) {
  if (Array.isArray(data)) return data.filter(isPost);
  if (isPost(data)) return [data];
  if (data && typeof data === 'object') {
    for (const value of Object.values(data)) {
      if (Array.isArray(value) && value.some(isPost)) return value.filter(isPost);
    }
  }
  return [];
}

export async function translateWpJson(data, { single, deadlineMs } = {}) {
  const posts = findPosts(data);
  if (!posts.length) return { data, complete: true };
  const full = single ?? posts.length === 1;

  const text = {};
  const html = {};
  const apply = []; // how to put each translated piece back

  posts.forEach((post, p) => {
    const add = (value, set, label) => {
      if (typeof value !== 'string' || !GEORGIAN.test(value)) return;
      const key = `${p}:${label}`;
      const isHtml = /<[a-z][^>]*>/i.test(value);
      if (!full && value.length > SHORT) {
        // A long text inside a list: translate only its beginning (what a
        // card preview shows); the rest stays as is.
        const [head, rest] = splitPreview(value, LIST_PREVIEW_CHARS);
        if (!head) return;
        (isHtml ? html : text)[key] = head;
        apply.push({ key, kind: isHtml ? 'html' : 'text', set: (v) => set(v + (isHtml || /\s$/.test(v) ? '' : ' ') + rest) });
        return;
      }
      (isHtml ? html : text)[key] = value;
      apply.push({ key, kind: isHtml ? 'html' : 'text', set });
    };

    if (post.title?.rendered) add(post.title.rendered, (v) => { post.title = { ...post.title, rendered: v }; }, 'title');
    // Custom endpoints: plain-text fields directly on the post (title, excerpt, …)
    for (const [k, v] of Object.entries(post)) {
      if (typeof v !== 'string' || SKIP_KEY.test(k) || /^(post_type|type|status|link|guid|author_name)$/.test(k)) continue;
      if (/^https?:\/\//.test(v.trim())) continue;
      add(v, (nv) => { post[k] = nv; }, `top.${k}`);
    }
    if (post.excerpt?.rendered) add(post.excerpt.rendered, (v) => { post.excerpt = { ...post.excerpt, rendered: v }; }, 'excerpt');
    if (post.content?.rendered) add(post.content.rendered, (v) => { post.content = { ...post.content, rendered: v }; }, 'content');
    if (post.acf && typeof post.acf === 'object') {
      for (const [k, v] of Object.entries(post.acf)) {
        if (SKIP_KEY.test(k) || /^language\d/.test(k)) continue;
        if (typeof v === 'string' && /^https?:\/\//.test(v.trim())) continue;
        add(v, (nv) => { post.acf = { ...post.acf, [k]: nv }; }, `acf.${k}`);
      }
    }
  });

  if (!apply.length) return { data, complete: true };
  const result = await translateContent({ text, html }, deadlineMs ? { deadlineMs } : undefined);
  for (const a of apply) {
    const value = a.kind === 'html' ? result.html[a.key] : result.text[a.key];
    if (typeof value === 'string') a.set(value);
  }
  return { data, complete: result.complete };
}
