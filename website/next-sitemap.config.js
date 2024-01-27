const { getVersions } = require('./src/static/getVersions');

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://immutable-js.com',
  generateRobotsTxt: true,
  outDir: './out',
  exclude: [
    '/docs',
    ...getVersions()
      .slice(1)
      .map(version => `/docs/${version}/*`),
  ],
};
