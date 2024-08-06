import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export default function handler(req) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') || 'Default Title';
  const imageUrl = searchParams.get('image') || 'https://mautskebeli.ge/api/og?title=Default%20Title';

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          color: 'white',
          background: `url(${encodeURIComponent(imageUrl)}) no-repeat center center`,
          backgroundSize: 'cover',
          width: '100%',
          height: '100%',
          padding: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {title}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
