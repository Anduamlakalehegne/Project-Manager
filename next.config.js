/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side configuration
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        'node-pre-gyp': false,
        bcrypt: false,
        crypto: false,
        stream: false,
        constants: false,
        os: false,
        path: false,
        zlib: false
      };
    }

    // Add rule to handle HTML files
    config.module.rules.push({
      test: /\.html$/,
      loader: 'ignore-loader'
    });

    return config;
  },
  // Disable server-side features that might cause issues
  experimental: {
    serverComponentsExternalPackages: ['bcrypt']
  }
};

module.exports = nextConfig;
