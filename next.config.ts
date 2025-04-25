import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/.well-known/farcaster.json',
        destination: '/api/well-known/farcaster',
      },
    ];
  },
};

export default nextConfig;
