// /utils/utils.js

export const constructUrl = (post) => {
    const { id, post_type, videoId, slug } = post;
  
    if (videoId) {
      return `/${post_type}?videoId=${videoId}`;
    }
  
    switch (post_type) {
      case "article":
        // Use slug if available, fallback to ID
        return `/all-articles/${slug || id}`;
      case "mau-books":
        return `/books/${slug || id}`;
      default:
        return `/${post_type}/${slug || id}`;
    }
  };
  
  export const extractVideoId = (videoUrl) => {
    const match = videoUrl.match(
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
    );
    return match ? match[1] : null;
  };
  
  export const customLoader = ({ src, width, quality }) => {
    return `${src}?w=${width}&q=${quality || 75}`;
  };
  