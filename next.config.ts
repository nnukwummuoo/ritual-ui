import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cloud.appwrite.io",
      },
      {
        protocol: "https",
        hostname: "gateway.storjshare.io",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
    ],
  },
  // Note: avoid setting a strict CSP here, it breaks Next.js dev overlay and inline styles/scripts.
  // If you need CSP, add it at your reverse proxy and allow Next dev requirements.
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://localhost:3100/:path*"
            : process.env.NEXT_PUBLIC_API
              ? `${process.env.NEXT_PUBLIC_API}/:path*`
              : "https://mmekoapi.onrender.com/:path*",
      },
    ];
  },
};

export default nextConfig;