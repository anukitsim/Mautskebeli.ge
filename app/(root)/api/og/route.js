import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export default function handler(req) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') || 'Default Title';

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          color: 'white',
          background: 'black',
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
