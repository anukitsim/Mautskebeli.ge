import ClientSideTranslate from './ClientSideTranslate'; // Import client component

// Server-side function to fetch the initial translations
async function fetchInitialTranslations() {
  const res = await fetch(
    'https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/targmani?acf_format=standard&_fields=id,title,acf,date&per_page=10&page=1',
    { cache: 'no-store' } // Disable caching
  );
  if (!res.ok) {
    throw new Error('Failed to fetch translations');
  }
  return res.json();
}

// Server Component: Fetches data server-side and passes it to the client component
export default async function TranslatePage() {
  const initialTranslations = await fetchInitialTranslations(); // Fetch initial translations server-side
  return <ClientSideTranslate initialTranslations={initialTranslations} />; // Pass to Client Component
}
