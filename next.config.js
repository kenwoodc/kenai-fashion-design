/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.ngrok.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.ngrok-free.app',
        port: '',
        pathname: '/**',
      }
    ],
    unoptimized: true
  },
  async rewrites() {
    return [
      {
        source: '/api/comfyui/:path*',
        destination: process.env.COMFYUI_URL ? `${process.env.COMFYUI_URL}/:path*` : 'http://localhost:8188/:path*'
      }
    ]
  },
  env: {
    COMFYUI_URL: process.env.COMFYUI_URL || 'http://localhost:8188'
  }
}

module.exports = nextConfig 