var assert = require("assert");
var Visitor = require("../lib/visitor").Visitor;
var types = require("../lib/types");
var namedTypes = types.namedTypes;
var builders = types.builders;
var parse = require("../lib/parser").parse;
var Printer = require("../lib/printer").Printer;

var lines = [
    "// file comment",
    "exports.foo({",
    "    // some comment",
    "    bar: 42,",
    "    baz: this",
    "});"
];

describe("visitor", function() {
    it("Visitor", function() {
        var source = lines.join("\n"),
            printer = new Printer,
            ast = parse(source),
            withThis = printer.print(ast).code,
            thisExp = /\bthis\b/g;

        assert.ok(thisExp.test(withThis));

        new ThisReplacer().visit(ast);

        assert.strictEqual(
            printer.print(ast).code,
            withThis.replace(thisExp, "self"));

        var bc = new BazChecker;

        bc.visit(ast);

        assert.deepEqual(bc.propNames, ["bar", "baz"]);

        new BazRemover().visit(ast);

        bc.clear();
        bc.visit(ast);

        assert.deepEqual(bc.propNames, ["bar"]);
    });

    var ThisReplacer = Visitor.extend({
        visitThisExpression: function(expr) {
            return builders.identifier("self");
        }
    });

    var BazChecker = Visitor.extend({
        init: function() {
            this.propNames = [];
        },

        clear: function() {
            this.propNames.length = 0;
        },

        visitProperty: function(prop) {
            var key = prop.key;
            this.propNames.push(key.value || key.name);
        }
    });

    var BazRemover = Visitor.extend({
        visitIdentifier: function(id) {
            if (id.name === "self")
                this.remove();
        }
    });

    it("Reindent", function() {
        var lines = [
            "a(b(c({",
            "    m: d(function() {",
            "        if (e('y' + 'z'))",
            "            f(42).h()",
            "                 .i()",
            "                 .send();",
            "        g(8);",
            "    })",
            "})));"],

            altered = [
            "a(xxx(function() {",
            "    if (e('y' > 'z'))",
            "        f(42).h()",
            "             .i()",
            "             .send();",
            "    g(8);",
            "}, c(function() {",
            "    if (e('y' > 'z'))",
            "        f(42).h()",
            "             .i()",
            "             .send();",
            "    g(8);",
            "})));"],

            source = lines.join("\n"),
            ast = parse(source),
            printer = new Printer;

        var ff = new FunctionFinder;
        ff.visit(ast);

        new ObjectReplacer(ff.funExpr).visit(ast);

        assert.strictEqual(
            altered.join("\n"),
            printer.print(ast).code);
    });

    var FunctionFinder = Visitor.extend({
        visitFunctionExpression: function(expr) {
            this.funExpr = expr;
            this.genericVisit(expr);
        },

        visitBinaryExpression: function(expr) {
            expr.operator = ">";
        }
    });

    var ObjectReplacer = Visitor.extend({
        init: function(replacement) {
            this.replacement = replacement;
        },

        visitCallExpression: function(expr) {
            this.genericVisit(expr);

            if (namedTypes.Identifier.check(expr.callee) &&
                expr.callee.name === "b")
            {
                expr.callee.name = "xxx";
                expr["arguments"].unshift(this.replacement);
            }
        },

        visitObjectExpression: function(expr) {
            return this.replacement;
        }
    });
});
