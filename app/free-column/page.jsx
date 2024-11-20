// app/free-column/page.jsx

import ClientSideFreeColumns from './ClientSideFreeColumns';

// Server-side function to fetch the initial free columns with caching disabled
async function fetchInitialFreeColumns() {
  const res = await fetch(
    'https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/free-column?acf_format=standard&_fields=id,title,acf,date&per_page=10&page=1',
    { cache: 'no-store' } // Disable caching
  );
  if (!res.ok) {
    throw new Error('Failed to fetch free columns');
  }
  return res.json();
}

// Server Component: Fetches data server-side and passes it to the client component
export default async function FreeColumnsList() {
  const initialFreeColumns = await fetchInitialFreeColumns(); // Fetch initial free columns server-side without cache
  return <ClientSideFreeColumns initialFreeColumns={initialFreeColumns} />; // Pass to Client Component
}
