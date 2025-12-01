/** @type {import('next').NextConfig} */
const nextConfig = {
  // Dev origins for mobile testing
  allowedDevOrigins: [
    'http://192.168.68.83:3000',
    'http://localhost:3000'
  ],
  
  // Skip ESLint during builds (you have this already)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Image optimization for production
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Production optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,

  // Environment variables you want exposed to browser
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
};

export default nextConfig;