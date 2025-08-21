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
      // Temporarily redirect root to existing working page
      { source: '/', destination: '/business/dashboard' },
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
