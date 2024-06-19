// Import required modules and constants
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

// Route segment config
export const runtime = "edge";

// Function to fetch article details from the API
async function fetchArticleDetails(articleId) {
  const res = await fetch(`https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/article/${articleId}?acf_format=standard&_fields=id,title,acf,date`);
  if (!res.ok) {
    throw new Error('Failed to fetch article');
  }
  return res.json();
}

// Define a function to handle GET requests
export async function GET(req) {
  // Extract search parameters
  const { searchParams } = req.nextUrl;
  const articleId = searchParams.get("id");

  if (!articleId) {
    console.error('Article ID is missing');
    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000",
          color: "#fff",
          fontSize: 24,
        }}
      >
        Article ID is missing
      </div>,
      { width: 1200, height: 630 }
    );
  }

  try {
    // Fetch article details
    const article = await fetchArticleDetails(articleId);
    const { title, acf } = article;
    console.log('Fetched article details:', article);

    // Create an ImageResponse with dynamic content
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundImage: `url(${acf.image || process.env.NEXT_PUBLIC_DEFAULT_BG_IMAGE})`,
            backgroundSize: 'cover',
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              padding: "20px",
              borderRadius: "10px",
              color: "white",
              fontSize: "48px",
              fontFamily: "ALK Tall Mtavruli, sans-serif",
              textAlign: "center",
            }}
          >
            {title.rendered}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating Open Graph image:', error);
    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000",
          color: "#fff",
          fontSize: 24,
        }}
      >
        Error generating Open Graph image
      </div>,
      { width: 1200, height: 630 }
    );
  }
}
