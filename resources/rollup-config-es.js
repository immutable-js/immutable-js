/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from 'fs';
import path from 'path';
import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import stripBanner from 'rollup-plugin-strip-banner';

const copyright = fs.readFileSync(path.join('resources', 'COPYRIGHT'), 'utf-8');

const SRC_DIR = path.resolve('src');
const DIST_DIR = path.resolve('dist');

export default {
  input: path.join(SRC_DIR, 'Immutable.js'),
  output: {
    banner: copyright,
    name: 'Immutable',
    file: path.join(DIST_DIR, 'immutable.es.js'),
    format: 'es',
    sourcemap: false,
  },
  plugins: [commonjs(), json(), stripBanner(), buble()],
};
