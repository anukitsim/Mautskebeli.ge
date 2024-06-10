// pages/api/facebook-post/data.js
import { fetchFacebookPost } from '@/utils/fetchFacebookPost';

export default async function handler(req, res) {
  const { id } = req.query;
  console.log('Fetching post with ID:', id); // Add logging
  try {
    const post = await fetchFacebookPost(id);
    console.log('Fetched post:', post); // Add logging
    res.status(200).json(post);  // Use Next.js response helpers
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
