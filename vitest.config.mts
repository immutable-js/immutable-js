import { defineConfig } from 'vitest/config';
import typescript from '@rollup/plugin-typescript';
import buble from '@rollup/plugin-buble';

export default defineConfig({
  // immutable: process.env.CI
  // ? './dist/Immutable.js' // Point to the built file in CI
  // : './src/Immutable.js',
  // },
  plugins: [
    typescript(),
    buble({
      include: ['src/**/*.js', 'src/**/*.ts'],
    }),
  ],
  test: {
    alias: {
      immutable: new URL('./src/Immutable.js', import.meta.url).pathname,
    },
    include: ['__tests__/**/*.(ts|js)'],
    exclude: ['__tests__/ts-utils.ts'],
    // coverage: {
    //   reporter: ['text', 'json', 'html'],
    // },
  },
});
