AST Types
===

This module provides an efficient, modular,
[Esprima](https://github.com/ariya/esprima)-compatible implementation of
the [abstract syntax
tree](http://en.wikipedia.org/wiki/Abstract_syntax_tree) type hierarchy
pioneered by the [Mozilla Parser
API](https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API).

[![Build Status](https://travis-ci.org/benjamn/ast-types.png?branch=master)](https://travis-ci.org/benjamn/ast-types)

Installation
---

From NPM:

    npm install ast-types

From GitHub:

    cd path/to/node_modules
    git clone git://github.com/benjamn/ast-types.git
    cd ast-types
    npm install .

Basic Usage
---
```js
var assert = require("assert");
var n = require("ast-types").namedTypes;
var b = require("ast-types").builders;

var fooId = b.identifier("foo");
var ifFoo = b.ifStatement(fooId, b.blockStatement([
    b.expressionStatement(b.callExpression(fooId, []))
]));

assert.ok(n.IfStatement.check(ifFoo));
assert.ok(n.Statement.check(ifFoo));
assert.ok(n.Node.check(ifFoo));

assert.ok(n.BlockStatement.check(ifFoo.consequent));
assert.strictEqual(
    ifFoo.consequent.body[0].expression.arguments.length,
    0);

assert.strictEqual(ifFoo.test, fooId);
assert.ok(n.Expression.check(ifFoo.test));
assert.ok(n.Identifier.check(ifFoo.test));
assert.ok(!n.Statement.check(ifFoo.test));
```

AST Traversal
---

Because it understands the AST type system so thoroughly, this library
is able to provide excellent node iteration and traversal mechanisms.

Here's how you might iterate over the fields of an arbitrary AST node:
```js
var copy = {};
require("ast-types").eachField(node, function(name, value) {
    // Note that undefined fields will be visited too, according to
    // the rules associated with node.type, and default field values
    // will be substituted if appropriate.
    copy[name] = value;
})
```

If you want to perform a depth-first traversal of the entire AST,
that's also easy:
```js
var types = require("ast-types");
var Literal = types.namedTypes.Literal;
var isString = types.builtInTypes.string;
var stringCounts = {};

// Count the occurrences of all the string literals in this AST.
require("ast-types").traverse(ast, function(node) {
    if (Literal.check(node) && isString.check(node.value)) {
        if (stringCounts.hasOwnProperty(node.value)) {
            stringCounts[node.value] += 1;
        } else {
            stringCounts[node.value] = 1;
        }
    }
});
```

Here's an slightly deeper example demonstrating how to ignore certain
subtrees and inspect the node's ancestors:
```js
var types = require("ast-types");
var namedTypes = types.namedTypes;
var isString = types.builtInTypes.string;
var thisProperties = {};

// Populate thisProperties with every property name accessed via
// this.name or this["name"] in the current scope.
types.traverse(ast, function(node) {
    // Don't descend into new function scopes.
    if (namedTypes.FunctionExpression.check(node) ||
        namedTypes.FunctionDeclaration.check(node)) {
        // Return false to stop traversing this subtree without aborting
        // the entire traversal.
        return false;
    }

    // If node is a ThisExpression that happens to be the .object of a
    // MemberExpression, then we're interested in the .property of the
    // MemberExpression. We could have inverted this test to find
    // MemberExpressions whose .object is a ThisExpression, but I wanted
    // to demonstrate the use of this.parent.
    if (namedTypes.ThisExpression.check(node) &&
        namedTypes.MemberExpression.check(this.parent.node) &&
        this.parent.node.object === node) {

        var property = this.parent.node.property;

        if (namedTypes.Identifier.check(property)) {
            // The this.name case.
            thisProperties[property.name] = true;

        } else if (namedTypes.Literal.check(property) &&
                   isString.check(property.value)) {
            // The this["name"] case.
            thisProperties[property.value] = true;
        }
    }
});
```
Within the callback function, `this` is always an instance of a simple
`Path` type that has immutable `.node`, `.parent`, and `.scope`
properties. In general, `this.node` refers to the same node as the `node`
parameter, `this.parent.node` refers to the nearest `Node` ancestor,
`this.parent.parent.node` to the grandparent, and so on. These `Path`
objects are created during the traversal without modifying the AST nodes
themselves, so it's not a problem if the same node appears more than once
in the AST, because it will be visited with a distict `Path` each time it
appears.

Scope
---

The object exposed as `this.scope` during AST traversals provides
information about variable and function declarations in the scope that
contains `this.node`. See [scope.js](lib/scope.js) for its public
interface, which currently includes `.isGlobal`, `.getGlobalScope()`,
`.depth`, `.declares(name)`, `.lookup(name)`, and `.getBindings()`.

Custom AST Node Types
---

The `ast-types` module was designed to be extended. To that end, it
provides a readable, declarative syntax for specifying new AST node types,
based primarily upon the `require("ast-types").Type.def` function:
```js
var types = require("ast-types");
var def = types.Type.def;
var string = types.builtInTypes.string;
var b = types.builders;

// Suppose you need a named File type to wrap your Programs.
def("File")
    .bases("Node")
    .build("name", "program")
    .field("name", string)
    .field("program", def("Program"));

// Prevent further modifications to the File type (and any other
// types newly introduced by def(...)).
types.finalize();

// The b.file builder function is now available. It expects two
// arguments, as named by .build("name", "program") above.
var main = b.file("main.js", b.program([
    // Pointless program contents included for extra color.
    b.functionDeclaration(b.identifier("succ"), [
        b.identifier("x")
    ], b.blockStatement([
        b.returnStatement(
            b.binaryExpression(
                "+", b.identifier("x"), b.literal(1)
            )
        )
    ]))
]));

assert.strictEqual(main.name, "main.js");
assert.strictEqual(main.program.body[0].params[0].name, "x");
// etc.

// If you pass the wrong type of arguments, or fail to pass enough
// arguments, an AssertionError will be thrown.

b.file(b.blockStatement([]));
// ==> AssertionError: {"body":[],"type":"BlockStatement","loc":null} does not match type string

b.file("lib/types.js", b.thisExpression());
// ==> AssertionError: {"type":"ThisExpression","loc":null} does not match type Program
```
The `def` syntax is used to define all the default AST node types found in
[core.js](def/core.js),
[es6.js](def/es6.js),
[mozilla.js](def/mozilla.js),
[e4x.js](def/e4x.js), and
[fb-harmony.js](def/fb-harmony.js), so you have
no shortage of examples to learn from.
