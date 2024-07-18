import redirects from './redirects.json' assert { type: 'json' };

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['mautskebeli.wpenginepowered.com', 'img.youtube.com', 'www.mautskebeli.ge'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 420, 768, 1024, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    loader: 'default',
  },
  async redirects() {
    return redirects.map(({ source, destination }) => {
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
