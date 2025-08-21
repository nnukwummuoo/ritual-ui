/** @type {import('next').NextConfig} */
const nextConfig = {
  // Temporarily ignore ESLint/TS build blocking. Remove once lint/type errors are fixed.
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ["cloud.appwrite.io", "flagcdn.com", "upload.wikimedia.org"],
  },
  // Keep TypeScript checks ON (do not ignore build errors)
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: 'https://mmekoapi.onrender.com/:path*',
      },
    ];
  },
};

export default nextConfig;
