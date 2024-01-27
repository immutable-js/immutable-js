module.exports = {
  reactStrictMode: true,
  trailingSlash: true,
  output: 'export',

  // Issues while upgrading from next 11 to 12.
  // Possibly related to typescript parser missing ?
  // TODO Waiting the migration from tslint to eslint to reactivate this
  eslint: {
    ignoreDuringBuilds: true,
  },
};
