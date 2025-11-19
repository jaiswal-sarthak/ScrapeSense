import type { NextConfig } from "next";

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
  },
  turbopack: {
    root: __dirname,
  },

  // 🚫 Disable lint errors during next build (Vercel)
  eslint: {
    ignoreDuringBuilds: true,
  },
} as NextConfig;

export default nextConfig;