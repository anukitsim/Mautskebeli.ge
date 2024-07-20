import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return new Response('Missing id parameter', { status: 400 });
  }

  try {
    const res = await fetch(`https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/sport-article/${id}?acf_format=standard&_fields=id,title,acf,date`);
    if (!res.ok) {
      throw new Error('Failed to fetch article');
    }
    const article = await res.json();

    const title = article.title.rendered || 'Default Title';
    const description = article.acf['main-text'] ? article.acf['main-text'].substring(0, 200) : 'Default description';
    const image = article.acf.image || 'https://www.mautskebeli.ge/images/default-og-image.jpg';
    const url = `https://www.mautskebeli.ge/sport-articles/${id}`;

    return new Response(JSON.stringify({
      title,
      description,
      image,
      url
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching article for OG tags:', error);
    return new Response('Error fetching article for OG tags', { status: 500 });
  }
}
