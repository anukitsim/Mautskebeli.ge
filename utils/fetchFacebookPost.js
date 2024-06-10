  // utils/fetchFacebookPost.js
  import { headers } from 'next/headers';

  export const fetchFacebookPost = async (index) => {
    const headersInstance = headers();
    const host = headersInstance.get('host');
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

    return postsWithImagesAndCaptions[index] || null;
  };