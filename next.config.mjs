/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false, // Disable SWC minification
  async rewrites() {
    return [
      {
        source: '/api/proxy',
        destination: '/api/proxy',
      },
    ];
  },
};

export default nextConfig;