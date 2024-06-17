// Import required modules and constants
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

// Route segment config
export const runtime = "edge";

// Define a function to handle GET requests
export async function GET(req) {
  // Extract title from query parameters
  const { searchParams } = req.nextUrl;
  const postTitle = searchParams.get("title");

  // Fetch the font from the specified URL in your app's public directory
  const font = fetch(
    new URL("../../../../public/fonts/ALK_Tall_Mtavruli.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());
  const fontData = await font;

  // Create an ImageResponse with dynamic content
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          backgroundImage: `url(https://mautskebeli.ge/og-bg.svg)`,
          backgroundSize: "cover",
        }}
      >
        <div
          style={{
            marginLeft: 190,
            marginRight: 190,
            display: "flex",
            fontSize: 140,
            fontFamily: "ALK Tall Mtavruli, sans-serif",
            letterSpacing: "-0.05em",
            fontStyle: "normal",
            color: "white",
            lineHeight: "120px",
            whiteSpace: "pre-wrap",
          }}
        >
          {postTitle}
        </div>
      </div>
    ),
    // ImageResponse options
    {
      width: 1920,
      height: 1080,
      fonts: [
        {
          name: "ALK Tall Mtavruli",
          data: fontData,
          style: "normal",
        },
      ],
    }
  );
}
