/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static exports for now since we have API routes
  output: undefined,

  // Set the base path for GitHub Pages
  basePath: process.env.NODE_ENV === 'production' ? '/ailurocamp' : '',

  // Configure images
  // images: {
  //   domains: ['ailurotech.com'], // Add any image domains you need
  // },

  // Other Next.js config options
  reactStrictMode: true,

  // Ensure trailing slashes are handled correctly
  trailingSlash: true,
};

module.exports = nextConfig;
