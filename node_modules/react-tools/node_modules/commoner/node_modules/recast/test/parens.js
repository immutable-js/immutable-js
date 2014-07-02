var assert = require("assert");
var esprima = require("esprima");
var parse = require("../lib/parser").parse;
var Printer = require("../lib/printer").Printer;
var NodePath = require("ast-types").NodePath;
var util = require("../lib/util");
var n = require("../lib/types").namedTypes;
var b = require("../lib/types").builders;
var printer = new Printer;

function parseExpression(expr) {
    var ast = esprima.parse(expr);
    n.Program.assert(ast);
    ast = ast.body[0];
    if (n.ExpressionStatement.check(ast))
        return ast.expression;
    return ast;
}

function check(expr) {
    var ast1 = parseExpression(expr);
    var printed = printer.printGenerically(ast1).code;
    try {
        var ast2 = parseExpression(printed);
    } finally {
        assert.ok(
            util.deepEquivalent(ast1, ast2),
            expr + " printed incorrectly as " + printed
        );
    }
}

var operators = [
    "==", "!=", "===", "!==",
    "<", "<=", ">", ">=",
    "<<", ">>", ">>>",
    "+", "-", "*", "/", "%",
    "&", // TODO Missing from the Parser API.
    "|", "^", "in",
    "instanceof",
    "&&", "||"
];

describe("parens", function() {
    it("Arithmetic", function() {
        check("1 - 2");
        check("  2 +2 ");

        operators.forEach(function(op1) {
            operators.forEach(function(op2) {
                check("(a " + op1 + " b) " + op2 + " c");
                check("a " + op1 + " (b " + op2 + " c)");
            });
        });
    });

    it("Unary", function() {
        check("(-a).b");
        check("(+a).b");
        check("(!a).b");
        check("(~a).b");
        check("(typeof a).b");
        check("(void a).b");
        check("(delete a.b).c");
    });

    it("Binary", function() {
        check("(a && b)()");
        check("typeof (a && b)");
        check("(a && b)[c]");
        check("(a && b).c");
    });

    it("Sequence", function() {
        check("(a, b)()");
        check("a(b, (c, d), e)");
        check("!(a, b)");
        check("a + (b, c) + d");
        check("var a = (1, 2), b = a + a;");
        check("(a, { b: 2 }).b");
        check("[a, (b, c), d]");
        check("({ a: (1, 2) }).a");
        check("(a, b) ? (a = 1, b = 2) : (c = 3)");
        check("a = (1, 2)");
    });

    it("NewExpression", function() {
        check("new (a.b())");
        check("new (a.b())(c)");
        check("new a.b(c)");
        check("+new Date");
        check("(new Date).getTime()");
        check("new a");
        check("(new a)(b)");
        check("(new (a.b(c))(d))(e)");
        check("(new Date)['getTime']()");
        check('(new Date)["getTime"]()');
    });

    it("Numbers", function() {
        check("(1).foo");
        check("(-1).foo");
        check("+0");
        check("NaN.foo");
        check("(-Infinity).foo");
    });

    it("Assign", function() {
        check("!(a = false)");
        check("a + (b = 2) + c");
        check("(a = fn)()");
        check("(a = b) ? c : d");
        check("(a = b)[c]");
        check("(a = b).c");
    });

    it("Function", function() {
        check("a(function(){}.bind(this))");
        check("(function(){}).apply(this, arguments)");
        check("function f() { (function(){}).call(this) }");
        check("while (true) { (function(){}).call(this) }");
    });

    it("ObjectLiteral", function() {
        check("a({b:c(d)}.b)");
        check("({a:b(c)}).a");
    });

    it("ReprintedParens", function() {
        var code = "a(function g(){}.call(this));";
        var ast1 = parse(code);
        var body = ast1.program.body;

        // Copy the function from a position where it does not need
        // parentheses to a position where it does need parentheses.
        body.push(b.expressionStatement(
            body[0].expression.arguments[0]));

        var generic = printer.printGenerically(ast1).code;
        var ast2 = parse(generic);
        assert.ok(
            util.deepEquivalent(ast1, ast2),
            "generic reprinting failed: " + generic);

        var reprint = printer.print(ast1).code;
        var ast3 = parse(reprint);
        assert.ok(
            util.deepEquivalent(ast1, ast3),
            "conservative reprinting failed: " + reprint);

        body.shift();
        reprint = printer.print(ast1).code;
        var ast4 = parse(reprint);
        assert.strictEqual(ast4.program.body.length, 1);
        var callExp = ast4.program.body[0].expression;
        n.CallExpression.assert(callExp);
        n.MemberExpression.assert(callExp.callee);
        n.FunctionExpression.assert(callExp.callee.object);
        assert.ok(
            util.deepEquivalent(ast1, ast4),
            "reprinting after body.shift() failed: " + reprint
        );

        var objCode = "({ foo: 42 }.foo);";
        var objAst = parse(objCode);
        var memExp = objAst.program.body[0].expression;
        n.MemberExpression.assert(memExp);
        n.ObjectExpression.assert(memExp.object);
        n.Identifier.assert(memExp.property);
        assert.strictEqual(memExp.property.name, "foo");
        var blockStmt = b.blockStatement([b.expressionStatement(memExp)]);
        reprint = printer.print(blockStmt).code;
        assert.ok(
            util.deepEquivalent(blockStmt, parse(reprint).program.body[0]),
            "object literal reprinting failed: " + reprint
        );
    });

    it("don't reparenthesize valid IIFEs", function() {
        var iifeCode = "(function     spaces   () {        }.call()  )  ;";
        var iifeAst = parse(iifeCode);
        var iifeReprint = printer.print(iifeAst).code;
        assert.strictEqual(iifeReprint, iifeCode);
    });

    it("don't reparenthesize valid object literals", function() {
        var objCode = "(  {    foo   :  42}.  foo )  ;";
        var objAst = parse(objCode);
        var objReprint = printer.print(objAst).code;
        assert.strictEqual(objReprint, objCode);
    });

    it("NegatedLoopCondition", function() {
        var ast = parse([
            "for (var i = 0; i < 10; ++i) {",
            "  console.log(i);",
            "}"
        ].join("\n"))

        var loop = ast.program.body[0];
        var test = loop.test;
        var negation = b.unaryExpression("!", test);

        assert.strictEqual(
            printer.print(negation).code,
            "!(i < 10)"
        );

        loop.test = negation;

        assert.strictEqual(printer.print(ast).code, [
            "for (var i = 0; !(i < 10); ++i) {",
            "  console.log(i);",
            "}"
        ].join("\n"));
    });

    it("MisleadingExistingParens", function() {
        var ast = parse([
            // The key === "oyez" expression appears to have parentheses
            // already, but those parentheses won't help us when we negate the
            // condition with a !.
            'if (key === "oyez") {',
            "  throw new Error(key);",
            "}"
        ].join("\n"));

        var ifStmt = ast.program.body[0];
        ifStmt.test = b.unaryExpression("!", ifStmt.test);

        var binaryPath = new NodePath(ast).get(
            "program", "body", 0, "test", "argument");

        assert.ok(binaryPath.needsParens());

        assert.strictEqual(printer.print(ifStmt).code, [
            'if (!(key === "oyez")) {',
            "  throw new Error(key);",
            "}"
        ].join("\n"));
    });

    it("DiscretionaryParens", function() {
        var code = [
            "if (info.line && (i > 0 || !skipFirstLine)) {",
            "  info = copyLineInfo(info);",
            "}"
        ].join("\n");

        var ast = parse(code);

        var rightPath = new NodePath(ast).get(
            "program", "body", 0, "test", "right");

        assert.ok(rightPath.needsParens());
        assert.strictEqual(printer.print(ast).code, code);
    });
});
