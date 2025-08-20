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
      // Redirect root to marketing home page
      { source: '/', destination: '/(marketing)' },
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
