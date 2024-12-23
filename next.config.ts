// next.config.js
module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        // ... other fallbacks if needed
      };
    }
    return config;
  },
};