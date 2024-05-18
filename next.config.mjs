/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['mautskebeli.local', 'img.youtube.com', 'localhost'],
        
          formats: ['image/avif', 'image/webp']
        
      },
};

export default nextConfig;
