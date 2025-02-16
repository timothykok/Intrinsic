/** @type {import('next').NextConfig} */
const nextConfig = {
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