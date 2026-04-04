import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Required for the Docker multi-stage runner (copies only prod deps + .next/standalone)
  output: 'standalone',
};

export default nextConfig;
