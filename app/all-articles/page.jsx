// app/all-articles/page.jsx (Server Component)

import ClientSideArticles from './ClientSideArticles';

// Server-side function to fetch the initial articles with caching disabled
async function fetchInitialArticles() {
  const res = await fetch(
    'https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/article?acf_format=standard&_fields=id,title,acf,date&per_page=10&page=1',
    { cache: 'no-store' } // Disable caching
  );
  if (!res.ok) {
    throw new Error('Failed to fetch articles');
  }
  return res.json();
}

// Server Component: Fetches data server-side and passes it to the client component
export default async function AllArticlesList() {
  const initialArticles = await fetchInitialArticles(); // Fetch initial articles server-side without cache
  return <ClientSideArticles initialArticles={initialArticles} />; // Pass to Client Component
}

