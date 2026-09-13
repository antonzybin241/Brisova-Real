const webpack = require("webpack");

/**
 * CRA webpack 5 does not polyfill Node core modules.
 * Wagmi / Web3Modal / readable-stream need buffer (+ related fallbacks).
 */
module.exports = function override(config) {
  config.resolve = config.resolve || {};
  config.resolve.fallback = {
    ...(config.resolve.fallback || {}),
    buffer: require.resolve("buffer/"),
    crypto: require.resolve("crypto-browserify"),
    stream: require.resolve("stream-browserify"),
    assert: require.resolve("assert/"),
    http: false,
    https: false,
    os: false,
    path: false,
    fs: false,
    net: false,
    tls: false,
    zlib: false,
    url: require.resolve("url/"),
    util: require.resolve("util/"),
    process: require.resolve("process/browser.js"),
    vm: require.resolve("vm-browserify"),
  };

  config.plugins = [
    ...(config.plugins || []),
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
      process: "process/browser.js",
    }),
  ];

  config.ignoreWarnings = [
    ...(config.ignoreWarnings || []),
    /Failed to parse source map/,
    /Critical dependency: the request of a dependency is an expression/,
  ];

  return config;
};
