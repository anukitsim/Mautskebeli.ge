// Shared data helpers for the 2026 homepage redesign.
// Scoped to app/components/homepage-2026 so nothing here affects other pages.

import { decode } from "html-entities";

const API = "https://mautskebeli.wpenginepowered.com/wp-json/wp/v2";

const dd = (iso) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
};

async function getMediaUrl(id) {
  if (!id) return null;
  try {
    const res = await fetch(`${API}/media/${id}?_fields=source_url`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.source_url || null;
  } catch {
    return null;
  }
}

// News has no byline data (real finding from the design phase — the field exists, is unused).
async function fetchNews(count) {
  const res = await fetch(
    `${API}/news?per_page=${count}&_fields=id,date,slug,title,acf`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) return [];
  const posts = await res.json();
  const withImages = await Promise.all(
    posts.map(async (p) => ({
      id: p.id,
      date: p.date,
      dateLabel: dd(p.date),
      // News has no acf.title (unlike article/free-column/targmani) — native WP title is the real field here.
      // title.rendered comes back HTML-entity-encoded from WP (e.g. "&#8211;"), acf fields usually don't — decode() is a safe no-op either way.
      title: decode(p.title?.rendered || p.acf?.title || ""),
      dek: decode(p.acf?.description || ""),
      image: await getMediaUrl(p.acf?.image),
      href: `/news/${p.slug}`,
      kind: "ამბები",
      byline: null,
    }))
  );
  return withImages;
}

// Article / Free Column / Translate share the same anatomy: title, sub_title, ავტორი (+ მთარგმნელი for translate).
async function fetchLongform(type, count, kindLabel, hrefBase) {
  const res = await fetch(
    `${API}/${type}?per_page=${count}&_fields=id,date,slug,title,acf`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) return [];
  const posts = await res.json();
  const withImages = await Promise.all(
    posts.map(async (p) => ({
      id: p.id,
      date: p.date,
      dateLabel: dd(p.date),
      title: decode(p.acf?.title || p.title?.rendered || ""),
      dek: decode(p.acf?.sub_title || ""),
      image: await getMediaUrl(p.acf?.image),
      href: `${hrefBase}/${p.slug || p.id}`,
      kind: kindLabel,
      byline: decode((p.acf?.["ავტორი"] || "").replace(/^ავტორი:\s*/, "")) || null,
      translator: type === "targmani" ? (p.acf?.["მთარგმნელი"] || null) : null,
    }))
  );
  return withImages;
}

const VIDEO_CATEGORIES = [
  { type: "shroma", label: "შრომა" },
  { type: "mecniereba", label: "მეცნიერება" },
  { type: "ekonomika", label: "ეკონომიკა" },
  { type: "medicina", label: "მედიცინა" },
  { type: "xelovneba", label: "ხელოვნება" },
  { type: "kalaki", label: "ქალაქი" },
  { type: "saxli", label: "სახლი ყველას" },
];

async function fetchVideoType(type, label, count) {
  const res = await fetch(
    `${API}/${type}?per_page=${count}&_fields=id,date,slug,acf`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) return [];
  const posts = await res.json();
  return Promise.all(
    posts.map(async (p) => ({
      id: `${type}-${p.id}`,
      date: p.date,
      dateLabel: dd(p.date),
      title: decode(p.acf?.title || ""),
      image: await getMediaUrl(p.acf?.main_page_image),
      href: `/${type}/${p.slug || p.id}`,
      kind: label,
    }))
  );
}

// Unified shelf: one latest item per category, pooled and sorted by recency —
// these are all video, so they're one shelf with chips, not seven separate blocks.
export async function getVideoShelfData() {
  const perCategory = await Promise.all(
    VIDEO_CATEGORIES.map(({ type, label }) => fetchVideoType(type, label, 1))
  );
  const pool = perCategory.flat().sort((a, b) => new Date(b.date) - new Date(a.date));
  return { chips: VIDEO_CATEGORIES.map((c) => c.label), shelf: pool.slice(0, 4) };
}

// მსოფლიო — separate row, same video tier, per Direction A.
export async function getWorldData() {
  return fetchVideoType("msoflio", "მსოფლიო", 2);
}

// მაუწყებელი გირჩევთ — team's editorial picks, powered by the real `rcheuli` ACF
// flag your team already uses (confirmed live on free-column/targmani posts).
// Reuses the same aggregated endpoint the existing HomePageRcheuli.jsx client component uses.
export async function getRecommendsData() {
  try {
    const res = await fetch(
      "https://mautskebeli.wpenginepowered.com/wp-json/custom/v1/acf-fields",
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data
      .filter((p) => p.acf_fields?.rcheuli)
      .filter((p) => !["sporti-videos", "sporti"].includes(p.post_type))
      .sort((a, b) => new Date(b.modified) - new Date(a.modified))
      .slice(0, 4)
      .map((p) => ({
        id: p.post_id,
        title: decode(p.acf_fields?.title || p.title || ""),
        image: p.acf_fields?.image || null,
        kind: p.post_type,
      }));
  } catch {
    return [];
  }
}

export async function getTextZoneData() {
  const [news, articles, freeColumn, targmani] = await Promise.all([
    fetchNews(7),
    fetchLongform("article", 3, "სტატია", "/all-articles"),
    fetchLongform("free-column", 2, "თავისუფალი სვეტი", "/free-column"),
    fetchLongform("targmani", 2, "თარგმანი", "/translate"),
  ]);

  // Rule, confirmed in design: news wins the lead slot regardless of recency vs. the rest.
  const lead = news[0] || null;
  const restOfNews = news.slice(1);

  // Secondary slots + nothing-to-do-with-the-rail pool: everything except the lead, by recency.
  const pool = [...restOfNews, ...articles, ...freeColumn, ...targmani].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  const secondary = pool.slice(0, 2);

  // Rail: more news beyond the lead, independent of whether it also won a secondary slot.
  const rail = restOfNews.slice(0, 5);

  return { lead, secondary, rail };
}
