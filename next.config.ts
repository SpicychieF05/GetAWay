import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Produce a standalone output which can be helpful for deployments
  output: "standalone",
  // Cache static image/font assets long-term; JS/CSS chunks are handled by
  // Next.js's built-in content-hash cache-busting — do NOT set immutable on them
  // or browsers will cache stale module graphs across deploys.
  async headers() {
    return [
      {
        source: "/:path*\\.(png|jpg|jpeg|gif|svg|webp|avif|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
