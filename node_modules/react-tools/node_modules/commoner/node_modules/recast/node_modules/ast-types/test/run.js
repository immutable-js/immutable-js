var assert = require("assert");
var types = require("../main");
var n = types.namedTypes;
var b = types.builders;
var path = require("path");
var fs = require("fs");
var esprima = require("esprima");
var esprimaSyntax = esprima.Syntax;
var parse = esprima.parse;
var Path = require("../lib/path");
var NodePath = require("../lib/node-path");

describe("basic type checking", function() {
    var fooId = b.identifier("foo");
    var ifFoo = b.ifStatement(fooId, b.blockStatement([
        b.expressionStatement(b.callExpression(fooId, []))
    ]));

    it("should exhibit sanity", function() {
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
    });
});

describe("isSupertypeOf", function() {
    it("should report correct supertype relationships", function() {
        var def = types.Type.def;

        assert.ok(def("Node").isSupertypeOf(def("Node")));
        assert.ok(def("Node").isSupertypeOf(def("Expression")));
        assert.ok(!def("Expression").isSupertypeOf(def("Node")));
        assert.ok(!def("Expression").isSupertypeOf(
            def("DebuggerStatement")));

        // TODO Make this test case more exhaustive.
    });
});

describe("shallow and deep checks", function() {
    var index = b.identifier("foo");
    var decl = b.variableDeclaration("var", [
        b.variableDeclarator(
            index,
            b.literal(42)
        )
    ]);

    it("should work when shallow", function() {
        assert.ok(n.Node.check(decl));
        assert.ok(n.Statement.check(decl));
        assert.ok(n.Declaration.check(decl));
        assert.ok(n.VariableDeclaration.check(decl));
    });

    it("should work when deep", function() {
        assert.ok(n.Node.check(decl, true));
        assert.ok(n.Statement.check(decl, true));
        assert.ok(n.Declaration.check(decl, true));
        assert.ok(n.VariableDeclaration.check(decl, true));
    });

    it("should fail when expected", function() {
        // Not an Expression.
        assert.ok(!n.Expression.check(decl));

        // This makes decl cease to conform to n.VariableDeclaration.
        decl.declarations.push(b.literal("bar"));

        assert.ok(n.Node.check(decl));
        assert.ok(n.Statement.check(decl));
        assert.ok(n.Declaration.check(decl));
        assert.ok(n.VariableDeclaration.check(decl));

        assert.ok(!n.Node.check(decl, true));
        assert.ok(!n.Statement.check(decl, true));
        assert.ok(!n.Declaration.check(decl, true));

        // As foretold above.
        assert.ok(!n.VariableDeclaration.check(decl, true));

        // Still not an Expression.
        assert.ok(!n.Expression.check(decl));
    });

    var fs = b.forStatement(
        decl,
        b.binaryExpression("<", index, b.literal(48)),
        b.updateExpression("++", index, true),
        b.blockStatement([
            b.expressionStatement(
                b.callExpression(index, [])
            )
        ])
    );

    it("should disagree according to depth", function() {
        assert.ok(n.Node.check(fs));
        assert.ok(n.Statement.check(fs));
        assert.ok(n.ForStatement.check(fs));

        // Not a true ForStatement because fs.init is not a true
        // VariableDeclaration.
        assert.ok(!n.Node.check(fs, true));
        assert.ok(!n.Statement.check(fs, true));
        assert.ok(!n.ForStatement.check(fs, true));
    });
});

function validateProgram(file) {
    var fullPath = path.join(__dirname, "..", file);

    it("should validate " + file, function(done) {
        fs.readFile(fullPath, "utf8", function(err, code) {
            if (err) throw err;

            assert.ok(n.Program.check(parse(code), true));
            assert.ok(n.Program.check(parse(code, { loc: true }), true));

            done();
        });
    });
}

describe("whole-program validation", function() {
    validateProgram("main.js");
    validateProgram("lib/shared.js");
    validateProgram("def/core.js");
    validateProgram("lib/types.js");
    validateProgram("test/run.js");
    validateProgram("test/data/backbone.js");
    validateProgram("test/data/jquery-1.9.1.js");
});

describe("esprima Syntax types", function() {
    it("should all be buildable", function() {
        var def = types.Type.def;
        var todo = {
            ClassHeritage: true,
            ComprehensionBlock: true,
            ComprehensionExpression: true,
            ExportSpecifierSet: true,
            Glob: true
        };

        Object.keys(esprimaSyntax).forEach(function(name) {
            if (todo[name] === true) return;
            assert.ok(n.hasOwnProperty(name), name);
        });

        Object.keys(n).forEach(function(name) {
            if (name in esprimaSyntax)
                assert.ok(def(name).buildable, name);
        });
    });
});

describe("types.getFieldValue", function() {
    it("should work for explicit fields", function() {
        assert.strictEqual(
            types.getFieldValue({
                type: "CatchClause"
            }, "type"),
            "CatchClause"
        );

        assert.strictEqual(
            types.getFieldValue({
                type: "CatchClause",
                guard: b.identifier("test")
            }, "guard").name,
            "test"
        );
    });

    it("should work for implicit/default fields", function() {
        assert.strictEqual(
            types.getFieldValue({
                type: "CatchClause"
            }, "guard"),
            null
        );

        assert.strictEqual(
            types.getFieldValue({
                type: "CatchClause"
            }, "asdf"),
            void 0
        );

        assert.deepEqual(
            types.getFieldValue({
                type: "TryStatement",
            }, "handler"),
            null
        );

        assert.deepEqual(
            types.getFieldValue({
                type: "TryStatement",
            }, "handlers"),
            []
        );

        assert.deepEqual(
            types.getFieldValue({
                type: "TryStatement",
            }, "guardedHandlers"),
            []
        );
    });

    it("should work for explicitly undefined fields", function() {
        assert.deepEqual(
            types.getFieldValue({
                type: "TryStatement",
                guardedHandlers: void 0
            }, "guardedHandlers"),
            []
        );
    });
});

describe("types.eachField", function() {
    var context = {};

    function check(node, names) {
        var seen = [];

        types.eachField(node, function(name, value) {
            assert.strictEqual(this, context);
            if (name === "type")
                assert.strictEqual(node.type, value);
            seen.push(name);
        }, context);

        assert.deepEqual(seen.sort(), names.sort());
    }

    it("should give correct keys for supertypes", function() {
        check({ type: "Expression" }, [
            "type", "loc"
        ]);
    });

    it("should work for non-buildable types", function() {
        check({ type: "Position" }, [
            "type", "line", "column"
        ]);

        check({ type: "SourceLocation" }, [
            "type", "start", "end", "source"
        ]);
    });

    it("should respect hidden fields", function() {
        check({ type: "TryStatement" }, [
            // Note that the "handlers" field is now hidden from eachField.
            "type", "block", "handler", "guardedHandlers", "finalizer", "loc"
        ]);
    });

    check({ type: "CatchClause" }, [
        "type", "param", "guard", "body", "loc"
    ]);

    it("should complain about invalid types", function() {
        assert.throws(function() {
            check({ type: "asdf" }, ["type"]);
        }, "did not recognize object of type " + JSON.stringify("asdf"));
    });

    it("should infer SourceLocation types", function() {
        check({
            line: 10,
            column: 37
        }, ["line", "column"]);
    });
});

describe("types.traverse", function() {
    var traverse = types.traverse;

    var call = b.expressionStatement(
        b.callExpression(
            b.memberExpression(
                b.identifier("foo"),
                b.identifier("bar"),
                false
            ),
            [b.literal("baz")]
        )
    );

    var ts = b.tryStatement(
        b.blockStatement([call, call]),
        b.catchClause(
            b.identifier("err"),
            null,
            b.blockStatement([])
        )
    );

    it("should have correct .parent path", function() {
        var literalCount = 0;

        n.TryStatement.assert(traverse(ts, function(node) {
            if (n.Literal.check(node)) {
                literalCount += 1;
                assert.strictEqual(node.value, "baz");
                assert.strictEqual(this.parent.node, call.expression);
                assert.strictEqual(this.parent.parent.node, call);
                assert.strictEqual(this.parent.parent.parent.node, ts.block);
                assert.strictEqual(this.parent.parent.parent.parent.node, ts);
                assert.strictEqual(this.parent.parent.parent.parent.parent, null);
            }
        }), true);

        assert.strictEqual(literalCount, 2);
    });

    it("should abort subtree traversal when false returned", function() {
        var ids = {};

        function findNamesSkippingMemberExprs(node) {
            if (n.MemberExpression.check(node)) {
                return false;
            }

            if (n.Identifier.check(node)) {
                ids[node.name] = true;
            }
        }

        traverse(ts, findNamesSkippingMemberExprs);

        // Make sure all identifers beneath member expressions were skipped.
        var expected = { err: true };
        assert.deepEqual(ids, expected);

        ids = {};
        // Make sure traverse.fast behaves the same way.
        traverse.fast(ts, findNamesSkippingMemberExprs);
        assert.deepEqual(ids, expected);

        function findAllNames(node) {
            if (n.Identifier.check(node)) {
                ids[node.name] = true;
            }
        }

        traverse(ts, findAllNames);

        // Now make sure those identifiers (foo and bar) were visited.
        assert.deepEqual(ids, expected = {
            err: true,
            foo: true,
            bar: true
        });

        ids = {};
        // Make sure traverse.fast behaves the same way.
        traverse.fast(ts, findAllNames);
        assert.deepEqual(ids, expected);
    });
});

describe("path traversal", function() {
    var call = b.expressionStatement(
        b.callExpression(
            b.memberExpression(
                b.identifier("foo"),
                b.identifier("bar"),
                false
            ),
            [b.literal("baz")]
        )
    );

    it("should accept root paths as well as AST nodes", function() {
        var path = new NodePath(call).get("expression", "callee");
        var idCount = 0;

        // Note that we're passing a path instead of a node as the first
        // argument to types.traverse.
        types.traverse(path, function(node) {
            if (n.Identifier.check(node)) {
                ++idCount;

                if (node.name === "bar") {
                    n.MemberExpression.assert(this.parent.node);
                    n.CallExpression.assert(this.parent.parent.node);
                    n.ExpressionStatement.assert(this.parent.parent.parent.node);
                }
            }
        });

        assert.strictEqual(idCount, 2);
    });
});

describe("replacing the root", function() {
    var ast = b.expressionStatement(
        b.unaryExpression("!", b.sequenceExpression([
            b.identifier("a"),
            b.identifier("b"),
            b.identifier("c")
        ]))
    );

    it("should be possible", function() {
        var callExp = types.traverse(ast, function(node) {
            if (n.ExpressionStatement.check(node)) {
                this.replace(b.callExpression(b.identifier("f"), [
                    node.expression
                ]));
            }
        });

        n.CallExpression.assert(callExp, true);
    });
});

describe("NodePath", function() {
    it("should have the expected type hierarchy", function() {
        assert.strictEqual(new Path({}).constructor, Path);

        var np = new NodePath(b.identifier("foo"));
        assert.strictEqual(np.constructor, NodePath);
        assert.ok(np.get("name") instanceof NodePath);
    });

    var ast = b.expressionStatement(
        b.unaryExpression("!", b.sequenceExpression([
            b.identifier("a"),
            b.identifier("b"),
            b.identifier("c")
        ]))
    );

    var path = new NodePath(ast);

    it("should have sane values, nodes, parents", function() {
        var opPath = path.get("expression", "operator");
        assert.strictEqual(opPath.value, "!");
        assert.strictEqual(opPath.node, ast.expression);
        assert.strictEqual(opPath.parent, path);
        assert.strictEqual(opPath.parent.node, ast);
    });

    var binaryYield = b.expressionStatement(
        b.logicalExpression(
            "&&",
            b.yieldExpression(b.identifier("a"), false),
            b.yieldExpression(b.identifier("b"), true)
        )
    );

    it("should support .needsParens()", function() {
        var argPath = path.get("expression", "argument");
        assert.ok(argPath.needsParens());

        var exprsPath = argPath.get("expressions");
        assert.ok(!exprsPath.needsParens());
        assert.strictEqual(exprsPath.get("length").value, 3);
        assert.ok(!exprsPath.get(1).needsParens());

        var byPath = new NodePath(binaryYield);
        assert.ok(!byPath.get("expression").needsParens());
        assert.ok(byPath.get("expression", "left").needsParens());
        assert.ok(byPath.get("expression", "right").needsParens());

        var sequenceAssignmentAST = b.assignmentExpression(
          '=',
          b.identifier('a'),
          b.sequenceExpression([b.literal(1), b.literal(2)])
        );

        var sequenceAssignmentPath = new NodePath(sequenceAssignmentAST);
        assert.ok(sequenceAssignmentPath.get("right").needsParens());
    });

    it("should support .needsParens(true)", function() {
        var programPath = new NodePath(parse("(function(){})"));
        var funExpPath = programPath.get("body", 0, "expression");
        n.FunctionExpression.assert(funExpPath.value);
        assert.strictEqual(funExpPath.needsParens(), true);
        assert.strictEqual(funExpPath.canBeFirstInStatement(), false);
        assert.strictEqual(funExpPath.firstInStatement(), true);
        assert.strictEqual(funExpPath.needsParens(true), false);

        programPath = new NodePath(parse("({ foo: 42 })"));
        var objLitPath = programPath.get("body", 0, "expression");
        n.ObjectExpression.assert(objLitPath.value);
        assert.strictEqual(objLitPath.needsParens(), true);
        assert.strictEqual(objLitPath.canBeFirstInStatement(), false);
        assert.strictEqual(objLitPath.firstInStatement(), true);
        assert.strictEqual(objLitPath.needsParens(true), false);
    });
});

describe("path.replace", function() {
    var ast;

    beforeEach(function() {
        ast = b.functionDeclaration(
            b.identifier("fn"),
            [],
            b.blockStatement([
                b.variableDeclaration(
                    "var",
                    [b.variableDeclarator(b.identifier("a"), null)]
                )
            ])
        );
    });

    it("should support replacement with a single node", function() {
        types.traverse(ast, function(node) {
            if (n.Identifier.check(node) && node.name === "a") {
                this.replace(b.identifier("b"));
            }
        });

        assert.equal(ast.body.body[0].declarations[0].id.name, "b");
    });

    it("should support replacement in an array with a single node", function() {
        types.traverse(ast, function(node) {
            if (n.VariableDeclaration.check(node)) {
                this.replace(b.returnStatement(null));
            }
        });

        assert.equal(ast.body.body.length, 1);
        assert.ok(n.ReturnStatement.check(ast.body.body[0]));
    });

    it("should support replacement with nothing", function() {
        types.traverse(ast, function(node) {
            if (n.VariableDeclaration.check(node)) {
                this.replace();
            }
        });

        assert.equal(ast.body.body.length, 0);
    });

    it("should support replacement with itself plus more in an array", function() {
        types.traverse(ast, function(node) {
            if (n.VariableDeclaration.check(node)) {
                var scopeBody = this.scope.path.get("body").get("body");

                // This is contrived such that we just happen to be replacing
                // the same node we're currently processing, perhaps using a
                // helper function to create variables at the top of the scope.
                assert.strictEqual(scopeBody.get(0), this);

                // Prepend `var $$;` inside the block. This should update our
                // `this` NodePath to correct its array index so that a
                // subsequent replace will still work.
                scopeBody.get(0).replace(
                    b.variableDeclaration(
                        "var",
                        [b.variableDeclarator(b.identifier("$$"), null)]
                    ),
                    scopeBody.get(0).value
                );

                // Now do it again to make sure all the other indexes are
                // updated, too.
                scopeBody.get(0).replace(
                    b.variableDeclaration(
                        "var",
                        [b.variableDeclarator(b.identifier("$2"), null)]
                    ),
                    scopeBody.get(0).value
                );

                // Then replace the node, not the one we just added.
                this.replace(b.returnStatement(b.identifier("$$")));
            }
        });

        var statements = ast.body.body;
        assert.deepEqual(
            statements.map(function(node) { return node.type; }),
            ['VariableDeclaration', 'VariableDeclaration', 'ReturnStatement']
        );
        assert.ok(n.VariableDeclaration.check(statements[0]), "not a variable declaration: " + statements[0].type);
        assert.equal(statements[0].declarations[0].id.name, "$2");
        assert.ok(n.VariableDeclaration.check(statements[1]), "not a variable declaration: " + statements[1].type);
        assert.equal(statements[1].declarations[0].id.name, "$$");
        assert.ok(n.ReturnStatement.check(statements[2]), "not a return statement: " + statements[2].type);
        assert.equal(statements[2].argument.name, "$$");
    });

    it("should throw when trying to replace the same node twice", function() {
        types.traverse(ast, function(node) {
            if (n.VariableDeclaration.check(node)) {
                this.replace(b.expressionStatement(b.literal(null)));

                var self = this;
                assert.throws(function() {
                    self.replace(b.expressionStatement(b.literal('NOPE')));
                }, /Cannot replace already replaced node: VariableDeclaration/);
            }
        });
    });
});

describe("global scope", function() {
    var traverse = types.traverse;

    var scope = [
        "var foo = 42;",
        "function bar(baz) {",
        "  return baz + foo;",
        "}"
    ];

    var ast = parse(scope.join("\n"));

    it("should be reachable from nested scopes", function() {
        var globalScope;

        traverse(ast, function(node) {
            if (n.Program.check(node)) {
                assert.strictEqual(this.scope.isGlobal, true);
                globalScope = this.scope;

            } else if (n.FunctionDeclaration.check(node)) {
                assert.strictEqual(this.scope.isGlobal, false);

                assert.strictEqual(node.id.name, "bar");
                assert.notStrictEqual(this.scope, globalScope);
                assert.strictEqual(this.scope.isGlobal, false);
                assert.strictEqual(this.scope.parent, globalScope);

                assert.strictEqual(this.scope.getGlobalScope(), globalScope);
            }
        });
    });

    it("should be found by .lookup and .declares", function() {
        var globalScope;

        traverse(ast, function(node) {
            if (n.Program.check(node)) {
                assert.strictEqual(this.scope.isGlobal, true);
                globalScope = this.scope;

            } else if (n.FunctionDeclaration.check(node)) {
                assert.ok(globalScope.declares("foo"));
                assert.ok(globalScope.declares("bar"));
                assert.strictEqual(this.scope.lookup("foo"), globalScope);
                assert.strictEqual(this.scope.lookup("bar"), globalScope);

                assert.ok(this.scope.declares("baz"));
                assert.strictEqual(this.scope.lookup("baz"), this.scope);

                assert.strictEqual(this.scope.lookup("qux"), null);
                assert.strictEqual(globalScope.lookup("baz"), null);
            }
        });
    });
});

describe("scope.getBindings", function () {
    var traverse = types.traverse;

    var scope = [
        "var foo = 42;",
        "function bar(baz) {",
        "  return baz + foo;",
        "}",
        "var nom = function rom(pom) {",
        "  return rom(pom);",
        "};"
    ];

    var ast = parse(scope.join("\n"));
    it("should get local and global scope bindings", function() {
        traverse(ast, function(node) {
            var bindings;
            if (n.Program.check(node)) {
                bindings = this.scope.getBindings();
                assert.deepEqual(["bar", "foo", "nom"], Object.keys(bindings).sort());
                assert.equal(1, bindings.foo.length);
                assert.equal(1, bindings.bar.length);
            } else if (n.FunctionDeclaration.check(node)) {
                bindings = this.scope.getBindings();
                assert.deepEqual(["baz"], Object.keys(bindings));
                assert.equal(1, bindings.baz.length);
            } else if (n.ReturnStatement.check(node) &&
                       n.Identifier.check(node.argument) &&
                       node.argument.name === "rom") {
                bindings = this.scope.getBindings();
                assert.deepEqual(["pom", "rom"], Object.keys(bindings).sort());
            }
        });
    });
});

describe("catch block scope", function() {
    var catchWithVarDecl = [
        "function foo(e) {",
        "  try {",
        "    bar();",
        "  } catch (e) {",
        "    var f = e + 1;",
        "    return function(g) {",
        "      return e + g;",
        "    };",
        "  }",
        "  return f;",
        "}"
    ];

    var path = new NodePath(parse(catchWithVarDecl.join("\n")));
    var fooPath = path.get("body", 0);
    var fooScope = fooPath.scope;
    var catchPath = fooPath.get("body", "body", 0, "handler");
    var catchScope = catchPath.scope;

    it("should not affect outer scope declarations", function() {
        n.FunctionDeclaration.assert(fooScope.node);
        assert.strictEqual(fooScope.declares("e"), true);
        assert.strictEqual(fooScope.declares("f"), true);
        assert.strictEqual(fooScope.lookup("e"), fooScope);
    });

    it("should declare only the guard parameter", function() {
        n.CatchClause.assert(catchScope.node);
        assert.strictEqual(catchScope.declares("e"), true);
        assert.strictEqual(catchScope.declares("f"), false);
        assert.strictEqual(catchScope.lookup("e"), catchScope);
        assert.strictEqual(catchScope.lookup("f"), fooScope);
    });

    it("should shadow only the parameter in nested scopes", function() {
        var closurePath = catchPath.get("body", "body", 1, "argument");
        var closureScope = closurePath.scope;
        n.FunctionExpression.assert(closureScope.node);
        assert.strictEqual(closureScope.declares("e"), false);
        assert.strictEqual(closureScope.declares("f"), false);
        assert.strictEqual(closureScope.declares("g"), true);
        assert.strictEqual(closureScope.lookup("g"), closureScope);
        assert.strictEqual(closureScope.lookup("e"), catchScope);
        assert.strictEqual(closureScope.lookup("f"), fooScope);
    });
});

describe("types.defineMethod", function() {
    function at(loc) {
        types.namedTypes.SourceLocation.assert(loc);
        this.loc = loc;
    }

    var thisExpr = b.thisExpression();

    it("should allow defining an .at method", function() {
        assert.strictEqual(types.defineMethod("at", at), void 0);
        assert.strictEqual(thisExpr.loc, null);

        thisExpr.at(b.sourceLocation(
            b.position(1, 0),
            b.position(1, 4)
        ));

        assert.strictEqual(thisExpr.loc.start.line, 1);
        assert.strictEqual(thisExpr.loc.start.column, 0);
        assert.strictEqual(thisExpr.loc.end.line, 1);
        assert.strictEqual(thisExpr.loc.end.column, 4);
    });

    it("should allow methods to be removed", function() {
        // Now try removing the method.
        assert.strictEqual(types.defineMethod("at"), at);
        assert.strictEqual(thisExpr.at, void 0);
        assert.strictEqual("at" in thisExpr, false);
    });
});
