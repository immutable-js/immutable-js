const { getVersions } = require('./src/static/getVersions');

module.exports = {
  siteUrl: 'https://immutable-js.com',
  generateRobotsTxt: true,
  exclude: [
    '/docs',
    ...getVersions()
      .slice(1)
      .map(version => `/docs/${version}/*`),
  ],
};
