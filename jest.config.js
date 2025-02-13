// eslint-disable-next-line no-undef
module.exports = {
  testRunner: 'jest-jasmine2', // See https://jestjs.io/blog/2021/05/25/jest-27#flipping-defaults as `jasmine-check` uses jasmine and not `jest-circus`
  moduleFileExtensions: ['js', 'ts'],
  resolver: '<rootDir>/resources/jestResolver.js',
  transform: {
    '^.+\\.(js|ts)$': '<rootDir>/resources/jestPreprocessor.js',
  },
  testRegex: '/__tests__/.*\\.(ts|js)$',
  unmockedModulePathPatterns: ['./node_modules/react'],
};
