import React from "react";
import { headers } from "next/headers";

const SingleFacebookPost = async ({ postId }) => {
  try {
    let post, isloading, error;
    const host = headers().get("host");
    const protocol = process?.env.NODE_ENV === "development" ? "http" : "https";
    const user_access_token = process.env.NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN;
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
          page_id: postId,
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
            pageId: postId,
            page_access_token,
          }),
        }
      );

      const { data } = await secondResponse.json();
      if (data.error) {
        throw new Error(`Facebook API Error: ${data.error.message}`);
      }
      console.log("Fetched post data:", data);
      post = data[0]; // Assuming the data structure is an array with one post
    } else {
      error = "no access token generated";
    }
    if (isloading) {
      return <p>Loading...</p>;
    }
    if (error) {
      return <p>Error: {error}</p>;
    }
    return (
      <div>
        {post && (
          <>
            <img
              src={post.attachments?.data[0]?.media?.image?.src}
              alt="Post Image"
            />
            <p>
              {post.message ||
                post.attachments?.data[0]?.caption ||
                "No Caption"}
            </p>
            {/* Additional content rendering goes here */}
          </>
        )}
      </div>
    );
  } catch (error) {
    error = "Error fetching post data. Please try again later.";
  }
};

export default SingleFacebookPost;
