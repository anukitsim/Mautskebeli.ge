
import { fetchFacebookPost } from './fetchFacebookPost';

let cachedPosts = [];

export const fetchMultipleFacebookPosts = async (count) => {
  if (cachedPosts.length >= count) {
    return cachedPosts.slice(0, count);
  }

  const posts = [];
  for (let i = 0; i < count; i++) {
    try {
      const post = await fetchFacebookPost(i);
      posts.push(post);
    } catch (error) {
      console.error(`Error fetching post ${i}:`, error.message);
      posts.push(null);
    }
  }

  cachedPosts = posts;
  return posts;
};