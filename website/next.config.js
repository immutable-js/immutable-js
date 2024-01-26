module.exports = {
  reactStrictMode: true,
  trailingSlash: true,

  // as next eslint config does not work with eslint 8.
  // TODO Waiting for nextjs upgrade to reactive this
  eslint: {
    ignoreDuringBuilds: true,
  },
};
