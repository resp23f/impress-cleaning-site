/** @type {import('next').NextConfig} */
const nextConfig = {
  // Dev origins for mobile testing
  allowedDevOrigins: [
    'http://192.168.68.83:3000',
    'http://localhost:3000'
  ],
  
  // Image optimization for production
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Production optimizations
  compress: true,
  poweredByHeader: false, // Good - already hiding this!
  reactStrictMode: true,

  // Environment variables you want exposed to browser
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
{
  key: 'X-Frame-Options',
  value: 'SAMEORIGIN',
},          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://js.stripe.com https://maps.googleapis.com https://challenges.cloudflare.com https://static.cloudflareinsights.com https://www.googletagmanager.com https://embed.tawk.to",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https: http:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://maps.googleapis.com https://places.googleapis.com https://challenges.cloudflare.com https://cloudflareinsights.com https://*.google-analytics.com https://*.tawk.to wss://*.tawk.to",
              "frame-src 'self' https://js.stripe.com https://challenges.cloudflare.com https://www.google.com https://tawk.to",
              "frame-ancestors 'self'",
              "worker-src 'self' blob:",
            ].join('; '),
          },
        ],
      },
    ]
  },
};

export default nextConfig;