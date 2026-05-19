import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  // Produce a standalone output which can be helpful for deployments
  output: "standalone",
  // Prevent lint errors from failing production builds on Vercel
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Add long-term caching headers for common static asset types
  async headers() {
    return [
      {
        source: "/:path*\\.(js|css|png|jpg|jpeg|gif|svg|webp|avif)",
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
