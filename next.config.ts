import type { NextConfig } from "next";
import withPWA from "next-pwa";

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
              : "",
      },
    ];
  },
};

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/, /app-build-manifest\.json$/],
  fallbacks: {
    document: '/offline',
  },
  publicExcludes: ['!robots.txt', '!sitemap.xml'],
  swSrc: 'public/worker.js', // Use custom unified service worker source (includes push notifications)
  sw: 'sw.js', // Output file name for the generated service worker
  // Note: runtimeCaching is not supported with swSrc - it's handled manually in worker.js
});

export default pwaConfig(nextConfig);