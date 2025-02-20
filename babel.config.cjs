/**
 * @param {import("@babel/core").ConfigAPI} api
 *
 * This file is a CJS file as jest and/or node 18 does not support ESM now
 */
// eslint-disable-next-line no-undef
module.exports = function (api) {
  // const isTest = api.env('test');

  // eslint-disable-next-line no-undef
  api.cache(() => process.env.NODE_ENV);

  const presets = [
    [
      '@babel/env',
      {
        targets: { browsers: ['last 2 versions', 'ie >= 10'] },
      },
    ],
    ['@babel/preset-typescript', { allowDeclareFields: true }],
  ];

  return {
    assumptions: {
      noClassCalls: true,
      superIsCallableConstructor: true,
    },
    presets,
  };
};
