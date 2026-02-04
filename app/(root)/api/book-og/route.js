import { NextResponse } from 'next/server';

export async function GET(req) {
  console.log('API translate-og hit');
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    console.error('Missing article ID');
    return NextResponse.json({ error: 'Missing article ID' }, { status: 400 });
  }

  try {
    const apiUrl = `https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/mau-books/${id}?acf_format=standard&_fields=id,title,acf,date`;
    console.log(`Fetching article from: ${apiUrl}`);

    const res = await fetch(apiUrl);

    if (!res.ok) {
      console.error(`Error fetching article: ${res.statusText}`);
      return NextResponse.json({ error: 'Failed to fetch article' }, { status: res.status });
    }

    const article = await res.json();
    console.log('Fetched article:', article);

    if (!article.acf) {
      console.error('ACF fields missing in article:', article);
      return NextResponse.json({ error: 'ACF fields missing in article' }, { status: 500 });
    }

    const rawDescription = article.acf.text || article.acf['main-text'] || '';
    const stripHtmlTags = (str) => {
      if (!str) return '';
      return str.replace(/<[^>]*>/g, '');
    };
    const cleanedDescription = stripHtmlTags(rawDescription).slice(0, 150);

    let imageUrl = 'https://www.mautskebeli.ge/images/og-logo.jpg';
    if (article.acf?.image) {
      const img = article.acf.image;
      const base = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://mautskebeli.wpenginepowered.com';
      if (typeof img === 'string' && img.startsWith('http')) imageUrl = img;
      else if (typeof img === 'string') imageUrl = `${base}${img}`;
      else if (typeof img === 'object' && img?.url) imageUrl = img.url.startsWith('http') ? img.url : `${base}${img.url}`;
    }

    const ogTags = {
      title: article.title.rendered,
      description: cleanedDescription,
      url: `https://www.mautskebeli.ge/books/${article.id}`,
      image: imageUrl,
    };

    return NextResponse.json(ogTags);
  } catch (error) {
    console.error('Unexpected error:', error.message);
    return NextResponse.json({ error: 'Unexpected error occurred' }, { status: 500 });
  }
}
