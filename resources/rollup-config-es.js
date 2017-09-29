import fs from 'fs';
import path from 'path';
import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import stripBanner from 'rollup-plugin-strip-banner';

const copyright = fs.readFileSync(path.join('resources', 'COPYRIGHT'), 'utf-8');

const SRC_DIR = path.resolve('src');
const DIST_DIR = path.resolve('dist');

export default {
  format: 'es',
  exports: 'named',
  sourceMap: false,
  banner: copyright,
  moduleName: 'Immutable',
  entry: path.join(SRC_DIR, 'Immutable.js'),
  dest: path.join(DIST_DIR, 'immutable.es.js'),
  plugins: [commonjs(), stripBanner(), buble()]
};
