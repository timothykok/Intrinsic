/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Disables ESLint checks during the build
  },
  async rewrites() {
    return [
      {
        source: "/api/proxy",
        destination: "/api/proxy",
      },
    ];
  },
};

export default nextConfig;