import ClientSideTranslate from './ClientSideTranslate'; // Import client component

// Server-side function to fetch the initial articles
async function fetchInitialArticles() {
  const res = await fetch(
    'https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/targmani?acf_format=standard&_fields=id,title,acf,date&per_page=10&page=1'
  );
  if (!res.ok) {
    throw new Error('Failed to fetch articles');
  }
  return res.json();
}

// Server Component: Fetches data server-side and passes it to the client component
export default async function TranslatePage() {
  const initialArticles = await fetchInitialArticles(); // Fetch initial articles server-side
  return <ClientSideTranslate initialArticles={initialArticles} />; // Pass to Client Component
}
