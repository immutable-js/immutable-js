/** @type {import('jest').Config} */
const config = {
  moduleFileExtensions: ['js', 'ts'],
  resolver: '<rootDir>/resources/jestResolver.js',
  testRegex: '/__tests__/.*\\.(ts|js)$',
  testPathIgnorePatterns: ['/__tests__/ts-utils.ts'],
};

export default config;
