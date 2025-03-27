// eslint-disable-next-line no-undef
module.exports = {
  moduleFileExtensions: ['js', 'ts'],
  resolver: '<rootDir>/resources/jestResolver.js',
  transform: {
    '^.+\\.(js|ts)$': '<rootDir>/resources/jestPreprocessor.js',
  },
  testRegex: '/__tests__/.*\\.(ts|js)$',
  testPathIgnorePatterns: ['/__tests__/ts-utils.ts'],
  unmockedModulePathPatterns: ['./node_modules/react'],
};
