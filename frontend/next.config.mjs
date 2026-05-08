/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    const backend = process.env.BACKEND_URL || 'http://localhost:3001';
    return [
      {
        source: '/api/:path*',
        destination: `${backend}/:path*`,
      },
    ];
  },
};

export default nextConfig;
