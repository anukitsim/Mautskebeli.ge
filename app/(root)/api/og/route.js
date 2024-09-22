// app/api/og/route.js

import { ImageResponse } from 'next/server';

export default function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'Default Title';
    const imageUrl = searchParams.get('image') || 'https://mautskebeli.ge/images/default-og-image.jpg';

    console.log("Generating image with title:", title);
    console.log("Using image URL:", imageUrl);

    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 60,
            color: 'white',
            backgroundImage: `url(${encodeURIComponent(imageUrl)})`,
            backgroundSize: 'cover',
            width: '100%',
            height: '100%',
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
  } catch (error) {
    console.error("Error generating image:", error);
    return new Response("Error generating image", { status: 500 });
  }
}
