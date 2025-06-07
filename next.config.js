/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/comfyui/:path*',
        destination: 'http://127.0.0.1:8188/:path*',
      },
    ];
  },
};

module.exports = nextConfig; 