/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var typescript = require('typescript');

var options = {
  noEmitOnError: true,
  target: typescript.ScriptTarget.ES2015,
  module: typescript.ModuleKind.CommonJS,
  strictNullChecks: true,
};

module.exports = {
  process(src, path) {
    if (path.endsWith('.ts') || path.endsWith('.tsx')) {
      return typescript.transpile(src, options, path, []);
    }
    return src;
  },
};
