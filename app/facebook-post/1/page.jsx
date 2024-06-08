import { fetchFacebookPost } from '../../../utils/fetchFacebookPost';
import PostContent from '@/app/components/PostContent';

async function getData() {
  const post = await fetchFacebookPost(0); // First post
  return post;
}

export default async function Page() {
  let post, error;

  try {
    post = await getData();
  } catch (err) {
    console.error('Error fetching or processing data:', err.message);
    error = 'Error fetching or processing data. Please try again later.';
  }

  return <PostContent post={post} error={error} />;
}
