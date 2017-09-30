/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from 'fs';
import path from 'path';
import { minify } from 'uglify-js';
import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import saveLicense from 'uglify-save-license';
import stripBanner from 'rollup-plugin-strip-banner';

const copyright = fs.readFileSync(path.join('resources', 'COPYRIGHT'), 'utf-8');

const SRC_DIR = path.resolve('src');
const DIST_DIR = path.resolve('dist');

export default {
  format: 'umd',
  exports: 'named',
  sourceMap: false,
  banner: copyright,
  moduleName: 'Immutable',
  entry: path.join(SRC_DIR, 'Immutable.js'),
  dest: path.join(DIST_DIR, 'immutable.js'),
  plugins: [
    commonjs(),
    stripBanner(),
    buble(),
    {
      name: 'uglify',
      transformBundle(code) {
        const result = minify(code, {
          fromString: true,
          mangle: { toplevel: true },
          output: { max_line_len: 2048, comments: saveLicense },
          compress: { comparisons: true, pure_getters: true, unsafe: true }
        });

        if (!fs.existsSync(DIST_DIR)) {
          fs.mkdirSync(DIST_DIR);
        }

        fs.writeFileSync(
          path.join(DIST_DIR, 'immutable.min.js'),
          result.code,
          'utf8'
        );
      }
    }
  ]
};
