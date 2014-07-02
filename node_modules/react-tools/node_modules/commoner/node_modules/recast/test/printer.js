var assert = require("assert");
var parse = require("../lib/parser").parse;
var Printer = require("../lib/printer").Printer;
var n = require("../lib/types").namedTypes;
var b = require("../lib/types").builders;

describe("printer", function() {
    it("Printer", function testPrinter(done) {
        var code = testPrinter + "";
        var ast = parse(code);
        var printer = new Printer;

        assert.strictEqual(typeof printer.print, "function");
        assert.strictEqual(printer.print(null).code, "");

        var string = printer.printGenerically(ast).code;
        assert.ok(string.indexOf("done();") > 0);

        string = printer.print(ast).code;

        // TODO

        assert.ok(string.indexOf("// TODO") > 0);

        done();
    });

    var uselessSemicolons = [
        'function a() {',
        '  return "a";',
        '};',
        '',
        'function b() {',
        '  return "b";',
        '};'
    ].join("\n");

    it("EmptyStatements", function() {
        var ast = parse(uselessSemicolons);
        var printer = new Printer({ tabWidth: 2 });

        var reprinted = printer.print(ast).code;
        assert.strictEqual(typeof reprinted, "string");
        assert.strictEqual(reprinted, uselessSemicolons);

        var generic = printer.printGenerically(ast).code;
        var withoutTrailingSemicolons = uselessSemicolons.replace(/\};/g, "}");
        assert.strictEqual(typeof generic, "string");
        assert.strictEqual(generic, withoutTrailingSemicolons);
    });

    var importantSemicolons = [
        "var a = {};", // <--- this trailing semi-colon is very important
        "(function() {})();"
    ].join("\n");

    it("IffeAfterVariableDeclarationEndingInObjectLiteral", function() {
        var ast = parse(importantSemicolons);
        var printer = new Printer({ tabWidth: 2 });

        var reprinted = printer.printGenerically(ast).code;
        assert.strictEqual(typeof reprinted, "string");
        assert.strictEqual(reprinted, importantSemicolons);
    });

    var switchCase = [
        "switch (test) {",
        "  default:",
        "  case a: break",
        "",
        "  case b:",
        "    break;",
        "}",
    ].join("\n");

    var switchCaseReprinted = [
        "if (test) {",
        "  switch (test) {",
        "  default:",
        "  case a: break",
        "  case b:",
        "    break;",
        "  }",
        "}"
    ].join("\n");

    var switchCaseGeneric = [
        "if (test) {",
        "  switch (test) {",
        "  default:",
        "  case a:",
        "    break;",
        "  case b:",
        "    break;",
        "  }",
        "}"
    ].join("\n");

    it("SwitchCase", function() {
        var ast = parse(switchCase);
        var printer = new Printer({ tabWidth: 2 });

        var body = ast.program.body;
        var switchStmt = body[0];
        n.SwitchStatement.assert(switchStmt);

        // This causes the switch statement to be reprinted.
        switchStmt.original = null;

        body[0] = b.ifStatement(
            b.identifier("test"),
            b.blockStatement([
                switchStmt
            ])
        );

        assert.strictEqual(
            printer.print(ast).code,
            switchCaseReprinted
        );

        assert.strictEqual(
            printer.printGenerically(ast).code,
            switchCaseGeneric
        );
    });

    var tryCatch = [
        "try {",
        "  a();",
        "} catch (e) {",
        "  b(e);",
        "}"
    ].join("\n");

    it("IndentTryCatch", function() {
        var ast = parse(tryCatch);
        var printer = new Printer({ tabWidth: 2 });
        var body = ast.program.body;
        var tryStmt = body[0];
        n.TryStatement.assert(tryStmt);

        // Force reprinting.
        assert.strictEqual(printer.printGenerically(ast).code, tryCatch);
    });

    var classBody = [
        "class A {",
        "  foo(x) { return x }",
        "  bar(y) { this.foo(y); }",
        "  baz(x, y) {",
        "    this.foo(x);",
        "    this.bar(y);",
        "  }",
        "}"
    ];

    var classBodyExpected = [
        "class A {",
        "  foo(x) { return x }",
        "  bar(y) { this.foo(y); }",
        "",
        "  baz(x, y) {",
        "    this.foo(x);",
        "    this.bar(y);",
        "  }",
        "",
        "  foo(x) { return x }",
        "}"
    ];

    it("MethodPrinting", function() {
        var code = classBody.join("\n");
        try {
            var ast = parse(code);
        } catch (e) {
            // ES6 not supported, silently finish
            return;
        }
        var printer = new Printer({ tabWidth: 2 });
        var cb = ast.program.body[0].body;
        n.ClassBody.assert(cb);

        // Trigger reprinting of the class body.
        cb.body.push(cb.body[0]);

        assert.strictEqual(
            printer.print(ast).code,
            classBodyExpected.join("\n")
        );
    });

    var multiLineParams = [
        "function f(/* first",
        "              xxx",
        "              param */ a,",
        "  // other params",
        "  b, c, // see?",
        "  d) {",
        "  return a + b + c + d;",
        "}"
    ];

    var multiLineParamsExpected = [
        "function f(",
        "  /* first",
        "     xxx",
        "     param */ a,",
        "  // other params",
        "  b,",
        "  // see?",
        "  c,",
        "  d) {",
        "  return a + b + c + d;",
        "}"
    ];

    it("MultiLineParams", function() {
        var code = multiLineParams.join("\n");
        var ast = parse(code);
        var printer = new Printer({ tabWidth: 2 });

        require("ast-types").traverse(ast, function(node) {
            // Drop all original source information.
            node.original = null;
        });

        assert.strictEqual(
            printer.print(ast).code,
            multiLineParamsExpected.join("\n")
        );
    });

    it("SimpleVarPrinting", function() {
        var printer = new Printer({ tabWidth: 2 });
        var varDecl = b.variableDeclaration("var", [
            b.variableDeclarator(b.identifier("x"), null),
            b.variableDeclarator(b.identifier("y"), null),
            b.variableDeclarator(b.identifier("z"), null)
        ]);

        assert.strictEqual(
            printer.print(b.program([varDecl])).code,
            "var x, y, z;"
        );

        var z = varDecl.declarations.pop();
        varDecl.declarations.pop();
        varDecl.declarations.push(z);

        assert.strictEqual(
            printer.print(b.program([varDecl])).code,
            "var x, z;"
        );
    });

    it("MultiLineVarPrinting", function() {
        var printer = new Printer({ tabWidth: 2 });
        var varDecl = b.variableDeclaration("var", [
            b.variableDeclarator(b.identifier("x"), null),
            b.variableDeclarator(
                b.identifier("y"),
                b.objectExpression([
                    b.property("init", b.identifier("why"), b.literal("not"))
                ])
            ),
            b.variableDeclarator(b.identifier("z"), null)
        ]);

        assert.strictEqual(printer.print(b.program([varDecl])).code, [
            "var x,",
            "    y = {",
            "      why: \"not\"",
            "    },",
            "    z;"
        ].join("\n"));
    });

    it("ForLoopPrinting", function() {
        var printer = new Printer({ tabWidth: 2 });
        var loop = b.forStatement(
            b.variableDeclaration("var", [
                b.variableDeclarator(b.identifier("i"), b.literal(0))
            ]),
            b.binaryExpression("<", b.identifier("i"), b.literal(3)),
            b.updateExpression("++", b.identifier("i"), /* prefix: */ false),
            b.expressionStatement(
                b.callExpression(b.identifier("log"), [b.identifier("i")])
            )
        );

        assert.strictEqual(
            printer.print(loop).code,
            "for (var i = 0; i < 3; i++)\n" +
            "  log(i);"
        );
    });

    it("EmptyForLoopPrinting", function() {
        var printer = new Printer({ tabWidth: 2 });
        var loop = b.forStatement(
            b.variableDeclaration("var", [
                b.variableDeclarator(b.identifier("i"), b.literal(0))
            ]),
            b.binaryExpression("<", b.identifier("i"), b.literal(3)),
            b.updateExpression("++", b.identifier("i"), /* prefix: */ false),
            b.emptyStatement()
        );

        assert.strictEqual(
            printer.print(loop).code,
            "for (var i = 0; i < 3; i++)\n" +
            "  ;"
        );
    });

    it("ForInLoopPrinting", function() {
        var printer = new Printer({ tabWidth: 2 });
        var loop = b.forInStatement(
            b.variableDeclaration("var", [
                b.variableDeclarator(b.identifier("key"), null)
            ]),
            b.identifier("obj"),
            b.expressionStatement(
                b.callExpression(b.identifier("log"), [b.identifier("key")])
            ),
            /* each: */ false
        );

        assert.strictEqual(
            printer.print(loop).code,
            "for (var key in obj)\n" +
            "  log(key);"
        );
    });

    it("GuessTabWidth", function() {
        var code = [
            "function identity(x) {",
            "  return x;",
            "}"
        ].join("\n");

        var guessedTwo = [
            "function identity(x) {",
            "  log(x);",
            "  return x;",
            "}"
        ].join("\n");

        var explicitFour = [
            "function identity(x) {",
            "    log(x);",
            "    return x;",
            "}"
        ].join("\n");

        var ast = parse(code);

        var funDecl = ast.program.body[0];
        n.FunctionDeclaration.assert(funDecl);

        var funBody = funDecl.body.body;

        funBody.unshift(
            b.expressionStatement(
                b.callExpression(
                    b.identifier("log"),
                    funDecl.params
                )
            )
        );

        assert.strictEqual(
            new Printer().print(ast).code,
            guessedTwo
        );

        assert.strictEqual(
            new Printer({
                tabWidth: 4
            }).print(ast).code,
            explicitFour
        );
    });

    it("FunctionDefaultsAndRest", function() {
        var printer = new Printer();
        var funExpr = b.functionExpression(
            b.identifier('a'),
            [b.identifier('b'), b.identifier('c')],
            b.blockStatement([]),
            false,
            false,
            false,
            undefined
        );

        funExpr.defaults = [undefined, b.literal(1)];
        funExpr.rest = b.identifier('d');

        assert.strictEqual(
            printer.print(funExpr).code,
            "function a(b, c=1, ...d) {}"
        );
    });

    it("ExportDeclaration semicolons", function() {
        var printer = new Printer();
        var code = "export var foo = 42;";
        var ast = parse(code);

        assert.strictEqual(printer.print(ast).code, code);
        assert.strictEqual(printer.printGenerically(ast).code, code);

        code = "export var foo = 42";
        ast = parse(code);

        assert.strictEqual(printer.print(ast).code, code);
        assert.strictEqual(printer.printGenerically(ast).code, code + ";");

        code = "export function foo() {}";
        ast = parse(code);

        assert.strictEqual(printer.print(ast).code, code);
        assert.strictEqual(printer.printGenerically(ast).code, code + ";");

        code = "export function foo() {};";
        ast = parse(code);

        assert.strictEqual(printer.print(ast).code, code);
        assert.strictEqual(printer.printGenerically(ast).code, code);
    });
});
