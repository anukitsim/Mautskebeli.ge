async function fetchArticleTitle(articleId) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
    if (!apiUrl) {
      throw new Error('NEXT_PUBLIC_WORDPRESS_API_URL is not defined');
    }
    const response = await fetch(`${apiUrl}/wp/v2/article/${articleId}?acf_format=standard&_fields=id,title,acf,date`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const article = await response.json();
    return article ? article.title.rendered : 'No title available';
  } catch (error) {
    console.error("Error fetching article title:", error);
    return 'No title available';
  }
}

module.exports = { fetchArticleTitle };
