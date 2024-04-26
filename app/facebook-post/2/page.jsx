import React from "react";
import Image from "next/image";
import { headers } from "next/headers";
import AlbumSlider from "../../components/AlbumSlider";

const PostPage = async () => {
  try {
    let currentImageIndex = 0;
    let post, error;
    const host = headers().get("host");
    const protocol = process?.env.NODE_ENV === "development" ? "http" : "https";
    const user_access_token = process.env.NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN;
    const pageId = "480323335835739";
    const response = await fetch(
      `${protocol}://${host}/api/facebook-access-token-endpoint`,
      {
        next: {
          revalidate: 600,
        },
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page_id: pageId,
          user_access_token: user_access_token,
        }),
      }
    );
    const { page_access_token } = await response.json();
    if (page_access_token) {
      const secondResponse = await fetch(
        `${protocol}://${host}/api/facebook-data`,
        {
          next: {
            revalidate: 600,
          },
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pageId: pageId,
            isPageToken: true,
            page_access_token,
          }),
        }
      );

      const { data } = await secondResponse.json();

      console.log("Raw data:", data);
      // Filter posts with both images and captions
      const postsWithImagesAndCaptions = data.filter(
        (post) =>
          post.attachments &&
          post.attachments.data &&
          post.attachments.data.some(
            (attachment) =>
              attachment.media &&
              ((attachment.media.image && attachment.type === "photo") ||
                attachment.type === "album")
          ) &&
          post.message
      );

      // Sort posts by timestamp in descending order
      postsWithImagesAndCaptions.sort(
        (a, b) => b.created_time - a.created_time
      );

      // Assuming index 0 corresponds to the latest post
      const selectedPost = postsWithImagesAndCaptions[1];
      post = selectedPost;
    }

    if (error) {
      return <p>Error: {error}</p>;
    }

    // Additional check to handle cases where the post is not an album
    if (
      !post.attachments ||
      !post.attachments.data ||
      post.attachments.data.length === 0
    ) {
      return (
        <div className="flex flex-col w-11/12 mx-auto mt-10 items-center gap-10">
          <div className="w-6/12">
            {post.message && <h1 className="">{post.message}</h1>}
          </div>
        </div>
      );
    }

    // Check if the post type is "album"
    if (post.attachments.data[0].type === "album") {
      return <AlbumSlider message={post?.message} post={post} />;
    }

    // If the post type is "photo", render a single image
    if (post.attachments.data[0].type === "photo") {
      return (
        <div className="flex flex-row-reverse w-11/12 mx-auto mt-10 items-center gap-10">
          <div className="w-6/12">
            {post.message && <h1 className="">{post.message}</h1>}
          </div>
          <div className="w-6/12">
            <img
              src={post.attachments.data[0].media.image.src}
              alt="Post Image"
              className="rounded-[6px] w-full"
            />
          </div>
        </div>
      );
    }

    return null; // Default case, return null for unsupported post types
  } catch (error) {
    console.log(error);
    console.error("Error fetching or processing data:", error.message);
    error = "Error fetching or processing data. Please try again later.";
  }
};

export default PostPage;
