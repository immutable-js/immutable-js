var fs = require('fs');
var path = require('path');
var vm = require('vm');

var TypeScript = {};

vm.runInNewContext(
  fs.readFileSync(
    path.resolve(
      __dirname,
      '../third_party/typescript/bin/typescriptServices.js'
    )
  ),
  { TypeScript: TypeScript }
);

module.exports = TypeScript;
