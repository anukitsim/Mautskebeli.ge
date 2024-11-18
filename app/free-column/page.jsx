import ClientSideFreeColumn from './ClientSideFreeColumn';

export default function FreeColumnPage() {
  // Fetching initial data from the server
  async function fetchInitialArticles() {
    try {
      const res = await fetch(
        'https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/free-column?acf_format=standard&_fields=id,title,acf,date&per_page=10&page=1'
      );
      if (!res.ok) {
        throw new Error('Failed to fetch articles');
      }
      const data = await res.json();
      console.log('Fetched Data:', data); // Log fetched data
      return data;
    } catch (error) {
      console.error('Error fetching articles:', error);
      return [];
    }
  }

  const initialArticles = fetchInitialArticles();

  return <ClientSideFreeColumn initialArticles={initialArticles} />;
}