// eslint-disable-next-line @typescript-eslint/no-require-imports, no-undef
const { getVersions } = require('./src/static/getVersions');

/** @type {import('next-sitemap').IConfig} */
// eslint-disable-next-line no-undef
module.exports = {
  siteUrl: 'https://immutable-js.com',
  generateRobotsTxt: true,
  outDir: './out',
  exclude: [
    '/docs',
    ...getVersions()
      .slice(1)
      .map((version) => `/docs/${version}/*`),
  ],
};
