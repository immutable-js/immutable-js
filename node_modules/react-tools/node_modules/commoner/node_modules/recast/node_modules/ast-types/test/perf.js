var path = require('path');
var fs = require('fs');
var traverse = require("ast-types").traverse;
var parse = require("esprima").parse;

var backbone = fs.readFileSync(
  path.join(__dirname, "data", "backbone.js"),
  "utf-8"
);

var ast = parse(backbone);

var names = [];
var start = +new Date;

traverse(ast, function(node) {
  names.push(this.name);
});

console.log(names.length);
console.log(new Date - start, "ms");
