/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      { source: '/', destination: '/solutions' },
    ];
  },
  experimental: {
    serverComponentsExternalPackages: ['mongodb'],
  },
  images: {
    domains: ['blob.v0.dev'],
    unoptimized: true,
  },
};

export default nextConfig;
