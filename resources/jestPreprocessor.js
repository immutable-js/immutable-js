/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var typescript = require('typescript');
const makeSynchronous = require('make-synchronous');

const TYPESCRIPT_OPTIONS = {
  noEmitOnError: true,
  target: typescript.ScriptTarget.ES2015,
  module: typescript.ModuleKind.CommonJS,
  strictNullChecks: true,
  sourceMap: true,
  inlineSourceMap: true,
};

function transpileTypeScript(src, path) {
  return typescript.transpile(src, TYPESCRIPT_OPTIONS, path, []);
}

function transpileJavaScript(src, path) {
  // Need to make this sync by calling `makeSynchronous`
  // while https://github.com/facebook/jest/issues/9504 is not resolved
  const fn = makeSynchronous(async (path) => {
    const rollup = require('rollup');
    const buble = require('rollup-plugin-buble');
    const commonjs = require('rollup-plugin-commonjs');
    const json = require('rollup-plugin-json');
    const stripBanner = require('rollup-plugin-strip-banner');

    // same input options as in rollup-config.js
    const inputOptions = {
      input: path,
      onwarn: () => {},
      plugins: [commonjs(), json(), stripBanner(), buble()],
    };

    const bundle = await rollup.rollup(inputOptions);

    const output = await bundle.generate({
      file: path,
      format: 'cjs',
      sourcemap: true,
    });

    return { code: output.code, map: output.map };
  });

  return fn(path);
}

module.exports = {
  process(src, path) {
    if (path.endsWith('__tests__/MultiRequire.js')) {
      // exit early for multi-require as we explicitly want to have several instances
      return src;
    }

    if (path.endsWith('.ts') || path.endsWith('.tsx')) {
      return transpileTypeScript(src, path);
    }

    return transpileJavaScript(src, path);
  },
};
