import { NextResponse } from 'next/server';
import { runSearch } from '../../../../utils/searchEngine';

/**
 * GET /api/search?q=... or ?query=...
 * Robust search across all site content: articles, news, videos, translations,
 * free column, books, sport articles. Uses the same WordPress endpoints
 * as the rest of the site and filters in memory (no dependency on WP ?search=).
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || searchParams.get('query') || '').trim();

  if (!q || q.length < 2) {
    return NextResponse.json(
      {
        error: 'Query too short',
        articles: [],
        news: [],
        videos: [],
        translations: [],
        freeColumns: [],
        books: [],
        sportArticles: [],
        meta: {},
      },
      { status: 400 }
    );
  }

  try {
    const result = await runSearch(q);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      {
        error: 'Search failed',
        articles: [],
        news: [],
        videos: [],
        translations: [],
        freeColumns: [],
        books: [],
        sportArticles: [],
        meta: {},
      },
      { status: 500 }
    );
  }
}
