/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['mautskebeli.wpenginepowered.com', 'img.youtube.com', 'localhost'],
        
          formats: ['image/avif', 'image/webp']
        
      },
      lineHeight: {
        'extra-loose': '2.5',  // Custom line height
      },
      fontFamily: {
        'alk-tall-mtavruli': ['"ALK Tall Mtavruli"', 'sans-serif'],
      },
      experimental: {
        appDir: true,
      },
};

export default nextConfig;
