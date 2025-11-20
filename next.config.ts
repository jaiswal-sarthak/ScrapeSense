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
} as NextConfig;

export default nextConfig;