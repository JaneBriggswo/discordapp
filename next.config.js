/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
  },
  images: {
    domains: [],
  },
  // Disable source maps in production to hide source code
  productionBrowserSourceMaps: false,
  
  // Optimize bundle to make it harder to reverse engineer
  webpack: (config, { dev, isServer }) => {
    if (!dev) {
      // Disable source maps completely in production
      config.devtool = false
      
      // Minify and obfuscate code
      config.optimization = {
        ...config.optimization,
        minimize: true,
        sideEffects: false,
      }
      
      // Remove comments and debug info
      config.optimization.minimizer = config.optimization.minimizer || []
      
      // Add custom plugin to remove debug info
      config.plugins.push({
        apply: (compiler) => {
          compiler.hooks.compilation.tap('RemoveDebugInfo', (compilation) => {
            compilation.hooks.processAssets.tap('RemoveDebugInfo', () => {
              // Remove source map references
              Object.keys(compilation.assets).forEach(filename => {
                if (filename.endsWith('.js')) {
                  const asset = compilation.assets[filename]
                  let source = asset.source()
                  
                  // Remove source map comments
                  source = source.replace(/\/\/# sourceMappingURL=.*/g, '')
                  source = source.replace(/\/\*# sourceMappingURL=.*\*\//g, '')
                  
                  // Add fake Next.js header
                  source = `/*! Next.js compiled code - ${new Date().toISOString()} */\n${source}`
                  
                  compilation.assets[filename] = {
                    source: () => source,
                    size: () => source.length
                  }
                }
              })
            })
          })
        }
      })
    }
    
    return config
  },
  
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