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
