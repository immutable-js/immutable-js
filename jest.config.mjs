/** @type {import('jest').Config} */
const config = {
  moduleFileExtensions: ['js', 'ts'],
  resolver: '<rootDir>/resources/jestResolver.js',
  transform: {
    '^.+\\.(js|ts)$': '<rootDir>/resources/jestPreprocessor.js',
  },
  testRegex: ['/__tests__/.*\\.(ts|js)$', '/website/.*\\.test\\.(ts|js)$'],
  testPathIgnorePatterns: ['/__tests__/ts-utils.ts'],
};

export default config;
