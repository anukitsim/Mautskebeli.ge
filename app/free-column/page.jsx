// app/free-column/page.jsx (Server Component)

import ClientSideFreeColumn from './ClientSideFreeColumn'; // Import client component

// Server-side function to fetch the initial articles
async function fetchInitialArticles() {
  try {
    const res = await fetch(
      'https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/free-column?acf_format=standard&_fields=id,title,acf,date&per_page=10&page=1'
    );
    if (!res.ok) {
      throw new Error('Failed to fetch articles');
    }

    const data = await res.json();
    console.log('Fetched Data:', data); // Log the fetched data
    return data;
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw error; // Re-throw error to be handled upstream
  }
}

// Server Component: Fetches data server-side and passes it to the client component
export default async function FreeColumnPage() {
  const initialArticles = await fetchInitialArticles(); // Fetch initial articles server-side
  return <ClientSideFreeColumn initialArticles={initialArticles} />; // Pass to Client Component
}
