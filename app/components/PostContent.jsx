// components/PostContent.jsx
import React from 'react';
import AlbumSlider from './AlbumSlider';

const PostContent = ({ post, error }) => {
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

export default PostContent;
