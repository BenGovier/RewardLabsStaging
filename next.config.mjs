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
      // No rewrites needed - (marketing) route group will handle root path
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
