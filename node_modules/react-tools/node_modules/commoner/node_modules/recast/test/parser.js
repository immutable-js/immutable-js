var assert = require("assert");
var parse = require("../lib/parser").parse;
var getReprinter = require("../lib/patcher").getReprinter;
var Printer = require("../lib/printer").Printer;
var Visitor = require("../lib/visitor").Visitor;
var printComments = require("../lib/comments").printComments;
var linesModule = require("../lib/lines");
var fromString = linesModule.fromString;
var concat = linesModule.concat;
var types = require("../lib/types");
var namedTypes = types.namedTypes;
var NodePath = types.NodePath;

// Esprima seems unable to handle unnamed top-level functions, so declare
// test functions with names and then export them later.

describe("parser", function() {
    it("Parser", function testParser(done) {
        var code = testParser + "";
        var ast = parse(code);

        namedTypes.File.assert(ast);
        assert.ok(getReprinter(new NodePath(ast)));

        var funDecl = ast.program.body[0],
            funBody = funDecl.body;

        namedTypes.FunctionDeclaration.assert(funDecl);
        namedTypes.BlockStatement.assert(funBody);
        assert.ok(getReprinter(new NodePath(funBody)));

        var lastStatement = funBody.body.pop(),
            doneCall = lastStatement.expression;

        assert.ok(!getReprinter(new NodePath(funBody)));
        assert.ok(getReprinter(new NodePath(ast)));

        funBody.body.push(lastStatement);
        assert.ok(getReprinter(new NodePath(funBody)));

        assert.strictEqual(doneCall.callee.name, "done");

        assert.ok(lastStatement.comments);
        assert.ok(lastStatement.comments instanceof Array);
        assert.strictEqual(lastStatement.comments.length, 2);

        var joinedComments = printComments(lastStatement.comments);
        var printedComments = joinedComments.toString();

        assert.strictEqual(joinedComments.length, 3);
        assert.strictEqual(printedComments.indexOf("Make sure"), 3);

        // Make sure done() remains the final statement in this function,
        // or the above assertions will probably fail.
        done();
    });

    it("LocationFixer", function() {
        var code = [
            "function foo() {",
            "    a()",
            "    b()",
            "}"
        ].join("\n");
        var ast = parse(code);
        var printer = new Printer;

        new FunctionBodyReverser().visit(ast);

        var altered = code
            .replace("a()", "xxx")
            .replace("b()", "a()")
            .replace("xxx", "b()");

        assert.strictEqual(altered, printer.print(ast).code);
    });

    var FunctionBodyReverser = Visitor.extend({
        visitFunctionDeclaration: function(expr) {
            expr.body.body.reverse();
        }
    });

    it("TabHandling", function() {
        function check(code, tabWidth) {
            var lines = fromString(code, { tabWidth: tabWidth });
            assert.strictEqual(lines.length, 1);
            new IdentVisitor(lines).visit(
                parse(code, { tabWidth: tabWidth })
            );
        }

        for (var tabWidth = 1; tabWidth <= 8; ++tabWidth) {
            check("\t\ti = 10;", tabWidth);
            check("\t\ti \t= 10;", tabWidth);
            check("\t\ti \t=\t 10;", tabWidth);
            check("\t \ti \t=\t 10;", tabWidth);
            check("\t \ti \t=\t 10;\t", tabWidth);
            check("\t \ti \t=\t 10;\t ", tabWidth);
        }
    });

    var IdentVisitor = Visitor.extend({
        init: function(lines) {
            this.lines = lines;
        },

        check: function(s, loc) {
            var sliced = this.lines.slice(loc.start, loc.end);
            assert.strictEqual(s + "", sliced.toString());
        },

        visitIdentifier: function(ident) {
            this.check(ident.name, ident.loc);
        },

        visitLiteral: function(lit) {
            this.check(lit.value, lit.loc);
        }
    });

    it("AlternateEsprima", function() {
        var types = require("../lib/types");
        var b = types.builders;
        var esprima = {
            parse: function(code) {
                var program = b.program([
                    b.expressionStatement(b.identifier("surprise"))
                ]);
                program.comments = [];
                return program;
            }
        };
        var ast = parse("ignored", { esprima: esprima });
        var printer = new Printer;

        types.namedTypes.File.assert(ast, true);
        assert.strictEqual(
            printer.printGenerically(ast).code,
            "surprise;");
    });
});
