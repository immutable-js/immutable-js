var typescript = require('typescript');
var react = require('react-tools');

function compileTypeScript(filePath) {
  var compiled;

  var options = {
    noEmitOnError: true,
    target: typescript.ScriptTarget.ES2015,
    module: typescript.ModuleKind.CommonJS
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

module.exports = {
  process: function(src, filePath) {
    if (filePath.match(/\.ts$/) && !filePath.match(/\.d\.ts$/)) {
      return compileTypeScript(filePath);
    }

    if (filePath.match(/\.js$/) && ~filePath.indexOf('/__tests__/')) {
      return react.transform(src, {harmony: true});
    }

    return src;
  }
};
