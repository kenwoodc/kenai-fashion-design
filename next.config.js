/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'images.unsplash.com', 'us8372439qz.vicp.fun'],
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
      },
      {
        protocol: 'http',
        hostname: '*.vicp.fun',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.vicp.fun',
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