// next.config.js
module.exports = {
  webpack: (config) => {
    // Treat the specific problematic file as raw text so Next.js won't parse it as a CSS Module.
    config.module.rules.push({
      test: /[\\/]src[\\/]app[\\/]home\.module\.css$/,
      use: [
        {
          loader: require.resolve('raw-loader'),
        },
      ],
    });
    return config;
  },
};
