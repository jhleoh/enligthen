/** @type {import('next').NextConfig} */
const nextConfig = {
  // appDir is enabled by default in Next.js 13+
  
  // Webpack configuration to improve chunk loading reliability
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Improve chunk loading reliability in development
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Create a vendor chunk for better caching
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Create a common chunk for shared code
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      }
      
      // Improve development build reliability
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    
    return config
  },
}

module.exports = nextConfig
