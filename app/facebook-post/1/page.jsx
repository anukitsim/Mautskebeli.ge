import React from 'react';
import AlbumSlider from '../../components/AlbumSlider';
import { headers } from 'next/headers';

const fetchFacebookPost = async () => {
  const host = headers().get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const user_access_token = process.env.NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN;
  const pageId = '480323335835739';

  const response = await fetch(`${protocol}://${host}/api/facebook-access-token-endpoint`, {
    next: {
      revalidate: 600,
    },
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      page_id: pageId,
      user_access_token: user_access_token,
    }),
  });

  const { page_access_token } = await response.json();

  if (!page_access_token) {
    throw new Error('Failed to obtain page access token');
  }

  const secondResponse = await fetch(`${protocol}://${host}/api/facebook-data`, {
    next: {
      revalidate: 600,
    },
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pageId: pageId,
      isPageToken: true,
      page_access_token,
    }),
  });

  const { data } = await secondResponse.json();

  const postsWithImagesAndCaptions = data.filter(
    (post) =>
      post.attachments &&
      post.attachments.data &&
      post.attachments.data.some(
        (attachment) =>
          attachment.media &&
          ((attachment.media.image && attachment.type === 'photo') || attachment.type === 'album')
      ) &&
      post.message
  );

  postsWithImagesAndCaptions.sort((a, b) => new Date(b.created_time) - new Date(a.created_time));

  return postsWithImagesAndCaptions[0] || null;
};

const PostPage = async () => {
  let post, error;

  try {
    post = await fetchFacebookPost();
  } catch (err) {
    console.error('Error fetching or processing data:', err.message);
    error = 'Error fetching or processing data. Please try again later.';
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!post.attachments || !post.attachments.data || post.attachments.data.length === 0) {
    return (
      <div className="flex flex-col w-11/12 mx-auto mt-10 items-center gap-10">
        <div className="w-6/12">
          {post.message && <h1 className="">{post.message}</h1>}
        </div>
      </div>
    );
  }

  if (post.attachments.data[0].type === 'album') {
    return <AlbumSlider message={post?.message} post={post} />;
  }

  if (post.attachments.data[0].type === 'photo') {
    return (
      <div className="flex flex-col w-11/12 mx-auto mt-10 items-center gap-10">
        <div className="w-6/12">
          <img
            src={post.attachments.data[0].media.image.src}
            alt="Post Image"
            className="rounded-[6px] w-full"
          />
        </div>
        <div className="w-6/12">
          {post.message && <h1 className="">{post.message}</h1>}
        </div>
      </div>
    );
  }

  return null;
};

export default PostPage;
