/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    'http://192.168.68.83:3000', // your Mac's IP (from earlier)
    'http://localhost:3000'
  ],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;