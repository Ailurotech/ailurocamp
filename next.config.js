/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static exports since we're deploying to Vercel
  output: undefined,

  // Configure images as needed
  images: {
    domains: [], // Add any image domains you need
  },

  // Other Next.js config options
  reactStrictMode: true,

  // Ensure trailing slashes are handled correctly
  trailingSlash: true,

  // ✅ Add HTTP security headers
  async headers() {
    return [
      {
        source: '/(.*)', // Match all routes
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; img-src * data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
