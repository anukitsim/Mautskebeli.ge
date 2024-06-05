import { fetchFacebookPost } from './fetchFacebookPost';
import { cachedPosts } from './fetchMultipleFacebookPosts';

export const addNewFacebookPost = async (postId) => {
  try {
    const newPost = await fetchFacebookPost(postId);
    if (newPost) {
      cachedPosts.unshift(newPost);  
    }
  } catch (error) {
    console.error(`Error adding new post ${postId}:`, error.message);
  }
};
