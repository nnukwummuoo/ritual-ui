/** @type {import('next').NextConfig} */
const nextConfig = {
 
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ["cloud.appwrite.io", "flagcdn.com", "upload.wikimedia.org"],
  },
 
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
