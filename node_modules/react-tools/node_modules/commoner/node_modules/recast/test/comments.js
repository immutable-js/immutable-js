var recast = require("../main");
var n = recast.types.namedTypes;
var b = recast.types.builders;
var fromString = require("../lib/lines").fromString;
var util = require("../lib/util");
var assert = require("assert");

var annotated = [
    "function dup(/* string */ s,",
    "             /* int */ n) /* string */",
    "{",
    "  // Use an array full of holes.",
    "  return Array(n + /*",
    "                    * off-by-*/ 1).join(s);",
    "}"
];

describe("comments", function() {
    it("Comments", function() {
        var code = annotated.join("\n");
        var ast = recast.parse(code);

        var dup = ast.program.body[0];
        n.FunctionDeclaration.assert(dup);
        assert.strictEqual(dup.id.name, "dup");

        // More of a basic sanity test than a comment test.
        assert.strictEqual(recast.print(ast).code, code);
        assert.strictEqual(recast.print(ast.program).code, code);
        assert.strictEqual(recast.print(dup).code, code);

        assert.strictEqual(
            recast.print(dup.params[0]).code,
            "/* string */ s"
        );

        assert.strictEqual(
            recast.print(dup.params[1]).code,
            "/* int */ n"
        );

        assert.strictEqual(
            recast.print(dup.body).code,
            ["/* string */"].concat(annotated.slice(2)).join("\n")
        );

        var retStmt = dup.body.body[0];
        n.ReturnStatement.assert(retStmt);

        var indented = annotated.slice(3, 6).join("\n");
        var flush = fromString(indented).indent(-2);

        assert.strictEqual(
            recast.print(retStmt).code,
            flush.toString()
        );

        var join = retStmt.argument;
        n.CallExpression.assert(join);

        var one = join.callee.object.arguments[0].right;
        n.Literal.assert(one);
        assert.strictEqual(one.value, 1);
        assert.strictEqual(recast.print(one).code, [
            "/*",
            " * off-by-*/ 1"
        ].join("\n"));
    });

    var trailing = [
        "Foo.prototype = {",
        "// Copyright (c) 2013 Ben Newman <bn@cs.stanford.edu>",
        "",
        "  /**",
        "   * Leading comment.",
        "   */",
        "  constructor: Foo, // Important for instanceof",
        "                    // to work in all browsers.",
        '  bar: "baz", // Just in case we need it.',
        "  qux: { // Here is an object literal.",
        "    zxcv: 42",
        "    // Put more properties here when you think of them.",
        "  } // There was an object literal...",
        "    // ... and here I am continuing this comment.",
        "",
        "};"
    ];

    var trailingExpected = [
        "Foo.prototype = {",
        "  // Copyright (c) 2013 Ben Newman <bn@cs.stanford.edu>",
        "",
        "  /**",
        "   * Leading comment.",
        "   */",
        "  // Important for instanceof",
        "  // to work in all browsers.",
        "  constructor: Foo,",
        "",
        "  // Just in case we need it.",
        '  bar: "baz",',
        "",
        "  // There was an object literal...",
        "  // ... and here I am continuing this comment.",
        "  qux: // Here is an object literal.",
        "  {",
        "    // Put more properties here when you think of them.",
        "    zxcv: 42,",
        "",
        "    asdf: 43",
        "  },",
        "",
        '  extra: "property"',
        "};"
    ];

    it("TrailingComments", function() {
        var code = trailing.join("\n");
        var ast = recast.parse(code);
        assert.strictEqual(recast.print(ast).code, code);

        // Drop all original source information to force reprinting.
        require("ast-types").traverse(ast, function(node) {
            node.original = null;
        });

        var assign = ast.program.body[0].expression;
        n.AssignmentExpression.assert(assign);

        var props = assign.right.properties;
        n.Property.arrayOf().assert(props);

        props.push(b.property(
            "init",
            b.identifier("extra"),
            b.literal("property")
        ));

        var quxVal = props[2].value;
        n.ObjectExpression.assert(quxVal);
        quxVal.properties.push(b.property(
            "init",
            b.identifier("asdf"),
            b.literal(43)
        ));

        var actual = recast.print(ast, { tabWidth: 2 }).code;
        var expected = trailingExpected.join("\n");

        // Check semantic equivalence:
        util.assertEquivalent(ast, recast.parse(actual));

        assert.strictEqual(actual, expected);
    });

    var paramTrailing = [
        "function foo(bar, baz /* = null */) {",
        "  assert.strictEqual(baz, null);",
        "}"
    ];

    var paramTrailingExpected = [
        "function foo(zxcv, bar, baz /* = null */) {",
        "  assert.strictEqual(baz, null);",
        "}"
    ];

    it("ParamTrailingComments", function() {
        var code = paramTrailing.join("\n");
        var ast = recast.parse(code);

        var func = ast.program.body[0];
        n.FunctionDeclaration.assert(func);

        func.params.unshift(b.identifier("zxcv"));

        var actual = recast.print(ast, { tabWidth: 2 }).code;
        var expected = paramTrailingExpected.join("\n");

        assert.strictEqual(actual, expected);
    });

    var protoAssign = [
        "A.prototype.foo = function() {",
        "  return this.bar();",
        "}", // Lack of semicolon screws up location info.
        "",
        "// Comment about the bar method.",
        "A.prototype.bar = function() {",
        "  return this.foo();",
        "}"
    ];

    it("ProtoAssignComment", function() {
        var code = protoAssign.join("\n");
        var ast = recast.parse(code);

        var foo = ast.program.body[0];
        var bar = ast.program.body[1];

        n.ExpressionStatement.assert(foo);
        n.ExpressionStatement.assert(bar);

        assert.strictEqual(foo.expression.left.property.name, "foo");
        assert.strictEqual(bar.expression.left.property.name, "bar");

        assert.ok(!foo.comments);
        assert.ok(bar.comments);
        assert.strictEqual(bar.comments.length, 1);
        assert.strictEqual(
            bar.comments[0].value,
            " Comment about the bar method."
        );
    });
});
