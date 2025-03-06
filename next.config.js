/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static exports since we're deploying to Vercel
  output: undefined,

  // Remove basePath for Vercel deployment
  // basePath: process.env.NODE_ENV === 'production' ? '/ailurocamp' : '',

  // Configure images as needed
  images: {
    domains: [], // Add any image domains you need
  },

  // Other Next.js config options
  reactStrictMode: true,

  // Ensure trailing slashes are handled correctly
  trailingSlash: true,

  // Configure to exclude API routes during static export
  skipMiddlewareUrlNormalize: true,
  distDir: 'dist',
  
  // Define routes to be excluded from the static export
  exportPathMap: async function() {
    return {
      '/': { page: '/' },
      // Add other routes here that should be included in static export
      // '/about': { page: '/about' },
      // '/contact': { page: '/contact' },
    };
  },
};

module.exports = nextConfig;
