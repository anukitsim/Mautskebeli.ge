import redirects from './redirects.json' assert { type: 'json' };

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['mautskebeli.wpenginepowered.com', 'img.youtube.com', 'localhost'],
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return redirects.map(({ source, destination }) => {
      // Handle query parameters separately
      const [path, query] = source.split('?');
      const sourceObj = { source: path, destination, permanent: true };

      if (query) {
        sourceObj.has = [
          {
            type: 'query',
            key: 'p',
            value: query.split('=')[1],
          },
        ];
      }

      return sourceObj;
    });
  },
};

export default nextConfig;
