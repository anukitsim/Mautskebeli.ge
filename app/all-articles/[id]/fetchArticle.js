// app/all-articles/[id]/fetchArticle.js
// Loads one post by slug, numeric id, or a FORMER slug (then _redirectFrom
// is set so the page can redirect). Shared by articles and free columns,
// their Georgian pages and their translated pages ([lang]).

export async function fetchPost(postType, slugOrId) {
  // Decode the slug/ID in case it's URL-encoded (Georgian characters)
  const decodedSlugOrId = decodeURIComponent(slugOrId);
  
  // Try fetching by slug first (URL-encode it properly for the API)
  let apiUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/${postType}?slug=${encodeURIComponent(decodedSlugOrId)}&acf_format=standard&_fields=id,title,acf,date,slug`;

  try {
    let res = await fetch(apiUrl, {
      next: { revalidate: 10 },
    });

    if (res.ok) {
      const articles = await res.json();
      if (articles && articles.length > 0) {
        return articles[0];
      }
    }

    // If slug doesn't work, try by ID (for backward compatibility)
    // Check if it's a number (ID) or string (slug)
    const isNumeric = !isNaN(decodedSlugOrId) && !isNaN(parseFloat(decodedSlugOrId));
    
    if (isNumeric) {
      apiUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/${postType}/${decodedSlugOrId}?acf_format=standard&_fields=id,title,acf,date,slug`;
      res = await fetch(apiUrl, {
        next: { revalidate: 10 },
      });

    if (!res.ok) {
        console.error(`Failed to fetch article with ID ${decodedSlugOrId}: ${res.status} ${res.statusText}`);
      return null;
    }

    const article = await res.json();
    return article;
    }

    // Not a current slug, and not numeric — it may be a FORMER slug (e.g.
    // an article whose URL was cleaned up to a Latin slug). Check WordPress's
    // own record of old slugs so links shared before the change still work.
    const resolveUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/custom/v1/resolve-article-slug?post_type=${postType}&slug=${encodeURIComponent(decodedSlugOrId)}`;
    const resolveRes = await fetch(resolveUrl, { next: { revalidate: 10 } });
    if (resolveRes.ok) {
      const resolved = await resolveRes.json();
      if (resolved.found) {
        return {
          id: resolved.id,
          slug: resolved.slug,
          title: resolved.title,
          date: resolved.date,
          acf: resolved.acf,
          _redirectFrom: decodedSlugOrId, // signals the page to 301 to the new slug
        };
      }
    }

    console.error(`Could not find article with slug: ${decodedSlugOrId}`);
    return null;
  } catch (error) {
    console.error(`Error fetching article with slug/id ${decodedSlugOrId}:`, error);
    return null;
  }
}

export function fetchArticle(slugOrId) {
  return fetchPost('article', slugOrId);
}
