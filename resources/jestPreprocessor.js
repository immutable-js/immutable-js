/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var typescript = require('typescript');

module.exports = {
  process: function(src, filePath) {
    var compiled;

    var options = {
      noEmitOnError: true,
      target: typescript.ScriptTarget.ES2015,
      module: typescript.ModuleKind.CommonJS,
      strictNullChecks: true,
    };

    var host = typescript.createCompilerHost(options);
    var program = typescript.createProgram([filePath], options, host);

    host.writeFile = (name, text) => compiled = text;
    var emitResult = program.emit();
    var diagnostics = typescript.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

    if (diagnostics.length === 0) {
      return compiled;
    }

    var report = typescript.formatDiagnostics(diagnostics, host);
    throw new Error('Compiling ' + filePath + ' failed' + '\n' + report);
  }
};
