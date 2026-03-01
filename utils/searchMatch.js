/**
 * Search matching: word-level, case-insensitive.
 * The query must appear as a standalone word or with a short suffix (≤3 chars)
 * to accommodate Georgian case endings (ს, ის, მა, ით, ში, ზე, etc.).
 *
 * "რატი" → matches "რატი", "რატიანი" (3-char suffix) but NOT "რატიფიკაცია" (7-char suffix)
 * "ტრამპი" → matches "ტრამპი", "ტრამპის" (1-char suffix) but NOT unrelated longer words
 */

const HIGHLIGHT_OPEN = '\u0000H\u0000';
const HIGHLIGHT_CLOSE = '\u0000/h\u0000';

function escapeRe(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Check if query appears as a word (with optional ≤3 letter suffix) in text.
 * Left: must be at a word boundary (not preceded by a Unicode letter).
 * Right: the query + at most 3 extra letters, then a non-letter or end.
 */
function containsAsWord(text, query) {
  if (!text || !query) return false;
  const q = query.trim();
  if (!q) return false;
  const escaped = escapeRe(q);
  const re = new RegExp(
    `(?<!\\p{L})${escaped}\\p{L}{0,3}(?!\\p{L})`,
    'iu'
  );
  return re.test(text);
}

/**
 * Highlight the query text where it appears as a word match.
 * Only the query portion is wrapped in markers (not the suffix).
 */
function highlight(text, query) {
  if (!text || !query) return text || '';
  const q = query.trim();
  if (!q) return text;
  const escaped = escapeRe(q);
  const re = new RegExp(
    `(?<!\\p{L})(${escaped})(?=\\p{L}{0,3}(?!\\p{L}))`,
    'giu'
  );
  return text.replace(re, (m) => `${HIGHLIGHT_OPEN}${m}${HIGHLIGHT_CLOSE}`);
}

/**
 * Build a contextual snippet around the first word-match of query in content.
 */
function getSnippet(content, query, maxLen = 200) {
  if (!content) return '';
  if (!query) return content.slice(0, maxLen);
  const q = query.trim();
  const escaped = escapeRe(q);
  const re = new RegExp(
    `(?<!\\p{L})${escaped}\\p{L}{0,3}(?!\\p{L})`,
    'iu'
  );
  const match = content.match(re);
  if (!match) return content.slice(0, maxLen);
  const idx = match.index;
  const start = Math.max(0, idx - 80);
  const end = Math.min(content.length, idx + match[0].length + 120);
  let snippet = content.slice(start, end).trim();
  if (start > 0) snippet = '…' + snippet;
  if (end < content.length) snippet += '…';
  return snippet;
}

/**
 * Score: title (100) > author (50) > content (1).
 */
function scoreAndMatch({ title = '', author = '', content = '' }, query) {
  if (!query || !query.trim()) return { score: 0, matchedIn: [] };
  const matchedIn = [];
  let score = 0;
  if (containsAsWord(title, query)) {
    matchedIn.push('title');
    score += 100;
  }
  if (containsAsWord(author, query)) {
    matchedIn.push('author');
    score += 50;
  }
  if (containsAsWord(content, query)) {
    matchedIn.push('content');
    score += 1;
  }
  return { score, matchedIn };
}

export {
  containsAsWord,
  highlight,
  getSnippet,
  scoreAndMatch,
  HIGHLIGHT_OPEN,
  HIGHLIGHT_CLOSE,
};
