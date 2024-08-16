export default function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'Default Title';
    const imageUrl = searchParams.get('image') || 'https://mautskebeli.ge/api/og?title=Default%20Title';

    console.log("Generating image with title:", title);
    console.log("Using image URL:", imageUrl);

    const cacheBuster = new Date().getTime();

    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 60,
            color: 'white',
            background: `url(${encodeURIComponent(imageUrl)}?cb=${cacheBuster}) no-repeat center center`,
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
  } catch (error) {
    console.error("Error generating image:", error);
    return new Response("Error generating image", { status: 500 });
  }
}
