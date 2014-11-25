var fs = require('fs');
var path = require('path');
var vm = require('vm');

var TypeScript = {};

vm.runInNewContext(
  fs.readFileSync(path.join(
      path.dirname(require.resolve('typescript')),
      'typescriptServices.js'
  )),
  { TypeScript: TypeScript }
);

module.exports = TypeScript;
