// eslint-disable-next-line import/no-unresolved
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // immutable: process.env.CI
  // ? './dist/Immutable.js' // Point to the built file in CI
  // : './src/Immutable.js',
  // },
  test: {
    alias: {
      immutable: new URL(
        process.env.CI
          ? './dist/immutable.js' // Point to the built file in CI
          : './src/Immutable.js',
        import.meta.url
      ).pathname,
    },
    include: ['__tests__/**/*.(ts|js)'],
    exclude: ['__tests__/ts-utils.ts'],
    // coverage: {
    //   reporter: ['text', 'json', 'html'],
    // },
  },
});
