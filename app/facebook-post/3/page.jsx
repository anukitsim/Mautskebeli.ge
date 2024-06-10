import { fetchFacebookPost } from '../../../utils/fetchFacebookPost';
import PostContent from '@/app/components/PostContent';
import YellowFacebookNews from '@/app/components/YellowFacebookNews';

async function getData(postId) {
  const post = await fetchFacebookPost(postId);
  return post;
}

export default async function Page() {
  let post, error;
  const postId = 2; // Current post ID

  try {
    post = await getData(postId);
  } catch (err) {
    console.error('Error fetching or processing data:', err.message);
    error = 'Error fetching or processing data. Please try again later.';
  }

  return (
    <div className='bg-[#FECE27]'>
      <PostContent post={post} error={error} />
      <YellowFacebookNews currentPostId={postId + 1} /> {/* Adjusted to match the route format */}
    </div>
  );
}
