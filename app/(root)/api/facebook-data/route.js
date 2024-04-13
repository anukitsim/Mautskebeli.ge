import { NextResponse } from "next/server";

export async function POST(req, res) {
  try {
    const request = await req.json();
    const { pageId, isPageToken = false, page_access_token } = request;

    const baseEndpoint = isPageToken
      ? `https://graph.facebook.com/v13.0/${pageId}`
      : "https://graph.facebook.com/v13.0/me";

    const response = await fetch(
      `${baseEndpoint}/posts?fields=message,attachments{caption,media,type,subattachments{media}},stream_status&access_token=${page_access_token}`, {
        next: {
          revalidate: 600
        }
      }
    );
    const data = await response.json();

    console.log("data", data);

    if (response.ok) {
      // Filter out posts without attachments, with video/live video types, and live stream posts
      const filteredData = data.data.filter(
        (post) =>
          post.attachments &&
          post.attachments.data &&
          post.attachments.data.some(
            (attachment) =>
              attachment.media &&
              (attachment.media.image || attachment.media.album)
          ) &&
          post.message &&
          (!post.stream_status || post.stream_status !== "LIVE")
      );

      return NextResponse.json({ data: filteredData || [] }, { status: 200 });
    } else {
      throw new Error(`Error fetching data: ${data.error.message}`);
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
