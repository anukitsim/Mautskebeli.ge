// /utils/utils.js

export const constructUrl = (post) => {
    const { id, post_type, videoId } = post;
  
    if (videoId) {
      return `/${post_type}?videoId=${videoId}`;
    }
  
    switch (post_type) {
      case "article":
        return `/all-articles/${id}`;
      case "mau-books":
        return `/books/${id}`;
      default:
        return `/${post_type}/${id}`;
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
  