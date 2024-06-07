/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['mautskebeli.wpenginepowered.com', 'img.youtube.com', 'localhost'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    appDir: true,
  },
};

export default nextConfig;
