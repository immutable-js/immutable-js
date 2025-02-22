module.exports = function (api) {
  // const isTest = api.env('test');

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
