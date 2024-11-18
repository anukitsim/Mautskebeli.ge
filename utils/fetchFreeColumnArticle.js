// utils.js
export async function fetchFreeColumnArticle(id) {
    const apiUrl = `https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/free-column/${id}?acf_format=standard&_fields=id,title,acf,date`;
    try {
      const res = await fetch(apiUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch article');
      return await res.json();
    } catch (error) {
      console.error(`Error fetching article with ID ${id}:`, error);
      return null;
    }
  }
  