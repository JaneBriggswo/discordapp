/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    webpackBuildWorker: true,
  },
  images: {
    domains: [],
  },
  // Disable source maps in production to hide source code
  productionBrowserSourceMaps: false,
  
  // Custom headers to hide framework info
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Server',
            value: 'Next.js'
          },
          {
            key: 'X-Powered-By',
            value: 'Next.js'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig