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
        hostname: "flagcdn.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
    ],
  },
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
