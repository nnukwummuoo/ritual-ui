import { withNextVideo } from "next-video/process";
import type { NextConfig } from "next";
import withPWA from "next-pwa";

// 🚀 Changed from 'any' to 'NextConfig' for proper TypeScript support
const nextConfig: NextConfig = {
  output: "standalone", // 👈 REQUIRED: Enables tiny Docker image sizes

  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    staleTimes: {
      dynamic: 0, 
      static: 180, 
    },
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "cloud.appwrite.io" },
      { protocol: "https", hostname: "gateway.storjshare.io" },
      { protocol: "https", hostname: "flagcdn.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "api.krea.ai" },
    ],
  },
  webpack: (config) => {
    // wagmi's connectors package dynamically imports several wallet SDKs as
    // *optional* peer dependencies. Webpack still statically analyzes those
    // import paths at build time even though they're never reached unless the
    // user actually picks that wallet — and Coinbase's newer SDKs
    // (@coinbase/cdp-sdk, pulled in via the baseAccount connector) currently
    // ship with broken internal @x402/* subpath imports that don't resolve at
    // all. Known upstream bug: https://github.com/wevm/wagmi/issues/4906
    // Aliasing these to a no-op module stops webpack from trying to resolve
    // them, without affecting any wallet we actually use.
    config.resolve.alias = {
      ...config.resolve.alias,
      "@coinbase/cdp-sdk": false,
      "@coinbase/wallet-sdk": false,
      "@gemini-wallet/core": false,
      "porto": false,
    };
    return config;
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
    image: '/offline',
    audio: '/offline', 
    video: '/offline',
    font: '/offline',
  },
  publicExcludes: ['!robots.txt', '!sitemap.xml'],
  swSrc: 'public/worker.js', 
  sw: 'sw.js', 
});

// @ts-ignore - next-pwa wrapper functions sometimes have loose type signatures
export default withNextVideo(pwaConfig(nextConfig));