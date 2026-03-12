import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@toppost/calc-engine', '@toppost/config'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
