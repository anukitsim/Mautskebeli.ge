import ClientSideBooks from './ClientSideBooks';

// Server-side function to fetch the initial books with caching disabled
async function fetchInitialBooks() {
  const res = await fetch(
    'https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/mau-books?acf_format=standard&_fields=id,title,acf,date&per_page=20&page=1',
    { cache: 'no-store' } // Disable caching
  );
  if (!res.ok) {
    throw new Error('Failed to fetch books');
  }
  return res.json();
}

// Server Component: Fetches data server-side and passes it to the client component
export default async function BooksList() {
  const initialBooks = await fetchInitialBooks(); // Fetch initial books server-side without cache
  return <ClientSideBooks initialBooks={initialBooks} />; // Pass to Client Component
}
