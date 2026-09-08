/** @type {import('next').NextConfig} */
const backendUrl = (
  process.env.BACKEND_API_URL
  || process.env.NEXT_PUBLIC_API_URL
  || 'http://127.0.0.1:8000'
).replace(/\/$/, '');

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['lucide-react', 'recharts'],
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
