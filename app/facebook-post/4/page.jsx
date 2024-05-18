// app/facebook-posts/3/page.jsx
import { fetchFacebookPost } from '../../../utils/fetchFacebookPost';
import PostContent from '@/app/components/PostContent';

const PostPage = async () => {
  let post, error;

  try {
    post = await fetchFacebookPost(3);  // Third post
  } catch (err) {
    console.error('Error fetching or processing data:', err.message);
    error = 'Error fetching or processing data. Please try again later.';
  }

  return <PostContent post={post} error={error} />;
};

export default PostPage;
