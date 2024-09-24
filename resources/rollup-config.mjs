import path from 'path';
import buble from '@rollup/plugin-buble';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import copyright from './copyright.mjs';

const SRC_DIR = path.resolve('src');
const DIST_DIR = path.resolve('dist');

// see https://github.com/immutable-js/immutable-js/issues/2019
const CIRCULAR_DEPS_IN_SRC_DIR = [
  'src/Seq.js -> src/Collection.js -> src/Seq.js',
  'src/Map.js -> src/Operations.js -> src/Map.js',
  'src/OrderedMap.js -> src/Map.js -> src/Operations.js -> src/OrderedMap.js',
];

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
      CIRCULAR_DEPS_IN_SRC_DIR
        ? {
            banner: copyright,
            name: 'Immutable',
            // generates one esm file with no circular imports
            file: path.join(DIST_DIR, 'es', 'Immutable.js'),
            format: 'es',
            sourcemap: false,
          }
        : {
            banner: copyright,
            name: 'Immutable',
            dir: path.join(DIST_DIR, 'es'),
            format: 'es',
            preserveModules: true,
            preserveModulesRoot: SRC_DIR,
            sourcemap: false,
          },
    ],
  },
];
