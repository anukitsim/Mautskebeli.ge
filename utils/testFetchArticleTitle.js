require('dotenv').config({ path: '.env.local' });  // Ensure the correct path to .env.local
const { fetchArticleTitle } = require('./fetchArticleTitle');

async function testFetchArticleTitle() {
  const articleId = '1280'; // Replace with a valid article ID from your data
  const title = await fetchArticleTitle(articleId);
  console.log(`Title for article ID ${articleId}:`, title);
}

// Run the test
testFetchArticleTitle();
