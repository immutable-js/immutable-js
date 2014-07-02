# JSTransform

A simple utility for pluggable JS syntax transforms using the esprima parser.

* Makes it simple to write and plug-in syntax transformations
* Makes it simple to coalesce multiple syntax transformations in a single pass of the AST
* Gives complete control over the formatting of the output on a per-transformation basis
* Supports source map generation
* Comes pre-bundled with a small set of (optional) ES6 -> ES5 transforms

## Examples
Using a pre-bundled or existing transform:
```js
/**
 * Reads a source file that may (or may not) contain ES6 classes, transforms it
 * to ES5 compatible code using the pre-bundled ES6 class visitors, and prints 
 * out the result.
 */
var es6ClassVisitors = require('jstransform/visitors/es6-class-visitors').visitorList;
var fs = require('fs');
var jstransform = require('jstransform');

var originalFileContents = fs.readFileSync('path/to/original/file.js', 'utf-8');

var transformedFileData = jstransform.transform(
  es6ClassVisitors,
  originalFileContents
);

console.log(transformedFileData.code);
```

Using multiple pre-bundled or existing transforms at once:
```js
/**
 * Reads a source file that may (or may not) contain ES6 classes *or* arrow
 * functions, transforms them to ES5 compatible code using the pre-bundled ES6 
 * visitors, and prints out the result.
 */
var es6ArrowFuncVisitors = require('jstransform/visitors/es6-arrow-function-visitors').visitorList;
var es6ClassVisitors = require('jstransform/visitors/es6-class-visitors').visitorList;
var jstransform = require('jstransform');

// Normally you'd read this from the filesystem, but I'll just use a string here
// to simplify the example.
var originalFileContents = "var a = (param1) => param1; class FooClass {}";

var transformedFileData = jstransform.transform(
  es6ClassVisitors.concat(es6ArrowFuncVisitors),
  originalFileContents
);

// var a = function(param1)  {return param1;}; function FooClass(){"use strict";}
console.log(transformedFileData.code);
```

Writing a simple custom transform:
```js
/**
 * Creates a custom transformation visitor that prefixes all calls to the
 * `eval()` function with a call to `alert()` saying how much of a clown you are
 * for using eval.
 */
var jstransform = require('jstransform');
var Syntax = require('esprima-fb').Syntax;
var utils = require('jstransform/src/utils');

function visitEvalCallExpressions(traverse, node, path, state) {
  // Appends an alert() call to the output buffer *before* the visited node
  // (in this case the eval call) is appended to the output buffer
  utils.append('alert("...eval?...really?...");', state);

  // Now we copy the eval expression to the output buffer from the original
  // source
  utils.catchup(node.range[1], state);
}
visitEvalCallExpressions.test = function(node, path, state) {
  return node.type === Syntax.CallExpression
         && node.callee.type === Syntax.Identifier
         && node.callee.name === 'eval';
};

// Normally you'd read this from the filesystem, but I'll just use a string here
// to simplify the example.
var originalFileContents = "eval('foo');";

var transformedFileData = jstransform.transform(
  [visitEvalCallExpressions], // Multiple visitors may be applied at once, so an
                              // array is always expected for the first argument
  originalFileContents
);

// alert("...eval?...really?...");eval('foo');
console.log(transformedFileData.code);
```
