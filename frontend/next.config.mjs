import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const isVercel = process.env.VERCEL === '1';
const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // standalone only for self-hosted (Docker/Railway); Vercel manages its own output
  ...(!isVercel && isProd ? { output: 'standalone', outputFileTracingRoot: path.resolve(__dirname, '..') } : {}),
  webpack(config) {
    config.resolve.alias['@'] = __dirname;
    return config;
  },
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
