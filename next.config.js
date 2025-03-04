/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports for GitHub Pages
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,

  // Set the base path for GitHub Pages
  basePath: process.env.NODE_ENV === 'production' ? '/ailurocamp' : '',

  // Disable image optimization for static export
  images: process.env.NODE_ENV === 'production' ? { unoptimized: true } : {},

  // Other Next.js config options
  reactStrictMode: true,

  // Ensure trailing slashes are handled correctly
  trailingSlash: true,
};

module.exports = nextConfig;
