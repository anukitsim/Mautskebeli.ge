// next.config.cjs

const redirects = require('./redirects.json');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // Disables Vercel's Image Optimization
    domains: [
      'mautskebeli.wpenginepowered.com',
      'img.youtube.com',
      'www.mautskebeli.ge',
      'media.mautskebeli.ge' // Cloudflare R2 domain
    ],
    formats: ['image/avif', 'image/webp'], // Optional: Keep if pre-optimizing via Cloudflare
    deviceSizes: [320, 420, 768, 1024, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
  async rewrites() {
    return [
      // Rewrite Georgian URLs to English folder structure
      {
        source: '/სტატიები/:path*',
        destination: '/all-articles/:path*',
      },
      {
        source: '/წიგნები/:path*',
        destination: '/books/:path*',
      },
      {
        source: '/თარგმანი/:path*',
        destination: '/translate/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
