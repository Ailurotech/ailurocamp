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
};

module.exports = nextConfig;
