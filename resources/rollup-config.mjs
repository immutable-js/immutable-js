import path from 'path';
import buble from '@rollup/plugin-buble';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import copyright from './copyright.mjs';

const SRC_DIR = path.resolve('src');
const DIST_DIR = path.resolve('dist');

export default [
  {
    input: path.join(SRC_DIR, 'Immutable.js'),
    plugins: [commonjs(), json(), buble()],
    output: [
      // umd build
      {
        banner: copyright,
        name: 'Immutable',
        exports: 'named',
        file: path.join(DIST_DIR, 'immutable.js'),
        format: 'umd',
        sourcemap: false,
      },
      // minified build for browsers
      {
        banner: copyright,
        name: 'Immutable',
        exports: 'named',
        file: path.join(DIST_DIR, 'immutable.min.js'),
        format: 'umd',
        sourcemap: false,
        plugins: [terser()],
      },
      // es build for bundlers and node
      {
        banner: copyright,
        name: 'Immutable',
        file: path.join(DIST_DIR, 'immutable.es.js'),
        format: 'es',
        sourcemap: false,
      },
    ],
  },
];
