import { NextResponse } from "next/server";
import { parse } from "node-html-parser";

export async function POST(req, res) {
  try {
    const request = await req.json();
    const { channelId } = request;

    const response = await fetch(
      `https://youtube.com/channel/${channelId}/live`,
      {
        redirect: "follow",
        cache: "no-store",
      }
    );
    const text = await response.text();
    const html = parse(text);
    const canonicalURLTag = html.querySelector("link[rel=canonical]");
    const title = html.querySelector("title").innerText
    const canonicalURL = canonicalURLTag.getAttribute("href");
    let youtubeUrl = new URL(canonicalURL);
    let params = new URLSearchParams(youtubeUrl.search);
    let liveVideoId = params.get("v");
    const isStreaming = canonicalURL.includes("/watch?v=");
    return NextResponse.json(
      {
        data: {
          stream:{
            id:liveVideoId,
            caption:title
          },
          isStreaming,
       
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
