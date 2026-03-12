import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@toppost/calc-engine', '@toppost/config'],
};

export default nextConfig;
