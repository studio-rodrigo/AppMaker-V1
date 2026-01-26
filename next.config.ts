import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['antd', '@ant-design/icons', '@ant-design/nextjs-registry'],
  // Enable standalone output for Docker deployment
  output: 'standalone',
};

export default nextConfig;
