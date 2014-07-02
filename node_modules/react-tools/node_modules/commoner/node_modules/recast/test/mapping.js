var assert = require("assert");
var sourceMap = require("source-map");
var types = require("../lib/types");
var n = types.namedTypes;
var b = types.builders;
var NodePath = types.NodePath;
var fromString = require("../lib/lines").fromString;
var parse = require("../lib/parser").parse;
var Printer = require("../lib/printer").Printer;
var Mapping = require("../lib/mapping");

describe("mapping", function() {
    it("Mapping", function() {
        var code = [
            "function foo(bar) {",
            "  return 1 + bar;",
            "}"
        ].join("\n");

        var lines = fromString(code);
        var ast = parse(code, {
            sourceFileName: "source.js"
        });

        var path = new NodePath(ast);
        var returnPath = path.get("program", "body", 0, "body", "body", 0);
        n.ReturnStatement.assert(returnPath.value);

        var leftPath = returnPath.get("argument", "left");
        var leftValue = leftPath.value;
        var rightPath = returnPath.get("argument", "right");

        leftPath.replace(rightPath.value);
        rightPath.replace(leftValue);

        var sourceRoot = "path/to/source/root";
        var printed = new Printer({
            sourceMapName: "source.map.json",
            sourceRoot: sourceRoot
        }).print(ast);

        assert.ok(printed.map);

        assert.strictEqual(
            printed.map.file,
            "source.map.json"
        );

        assert.strictEqual(
            printed.map.sourceRoot,
            sourceRoot
        );

        var smc = new sourceMap.SourceMapConsumer(printed.map);

        function check(origLine, origCol, genLine, genCol) {
            assert.deepEqual(smc.originalPositionFor({
                line: genLine,
                column: genCol
            }), {
                source: sourceRoot + "/source.js",
                line: origLine,
                column: origCol,
                name: null
            });

            assert.deepEqual(smc.generatedPositionFor({
                source: sourceRoot + "/source.js",
                line: origLine,
                column: origCol
            }), {
                line: genLine,
                column: genCol
            });
        }

        check(1, 0, 1, 0); // function
        check(1, 18, 1, 18); // {
        check(2, 2, 2, 2); // return
        check(2, 13, 2, 9); // bar
        check(2, 9, 2, 15); // 1
        check(2, 16, 2, 16); // ;
        check(3, 0, 3, 0); // }
    });

    it("InputSourceMap", function() {
        function addUseStrict(ast) {
            return types.traverse(ast, function(node) {
                if (n.Function.check(node)) {
                    node.body.body.unshift(
                        b.expressionStatement(b.literal("use strict"))
                    );
                }
            });
        }

        function stripConsole(ast) {
            return types.traverse(ast, function(node) {
                if (n.CallExpression.check(node) &&
                    n.MemberExpression.check(node.callee) &&
                    n.Identifier.check(node.callee.object) &&
                    node.callee.object.name === "console") {
                    n.ExpressionStatement.assert(this.parent.node);
                    this.parent.replace();
                    return false;
                }
            });
        }

        var code = [
            "function add(a, b) {",
            "  var sum = a + b;",
            "  console.log(a, b);",
            "  return sum;",
            "}"
        ].join("\n");

        var ast = parse(code, {
            sourceFileName: "original.js"
        });

        var useStrictResult = new Printer({
            sourceMapName: "useStrict.map.json"
        }).print(addUseStrict(ast));

        var useStrictAst = parse(useStrictResult.code, {
            sourceFileName: "useStrict.js"
        });

        var oneStepResult = new Printer({
            sourceMapName: "oneStep.map.json"
        }).print(stripConsole(ast));

        var twoStepResult = new Printer({
            sourceMapName: "twoStep.map.json",
            inputSourceMap: useStrictResult.map
        }).print(stripConsole(useStrictAst));

        assert.strictEqual(
            oneStepResult.code,
            twoStepResult.code
        );

        var smc1 = new sourceMap.SourceMapConsumer(oneStepResult.map);
        var smc2 = new sourceMap.SourceMapConsumer(twoStepResult.map);

        smc1.eachMapping(function(mapping) {
            var pos = {
                line: mapping.generatedLine,
                column: mapping.generatedColumn
            };

            var orig1 = smc1.originalPositionFor(pos);
            var orig2 = smc2.originalPositionFor(pos);

            // The composition of the source maps generated separately from
            // the two transforms should be equivalent to the source map
            // generated from the composition of the two transforms.
            assert.deepEqual(orig1, orig2);

            // Make sure the two-step source map refers back to the original
            // source instead of the intermediate source.
            assert.strictEqual(orig2.source, "original.js");
        });
    });

    it("BecomingNull", function() {
        // https://github.com/facebook/regenerator/issues/103
        var code = [
            "for (var i = 0; false; i++)",
            "  log(i);"
        ].join("\n");
        var ast = parse(code);
        var path = new NodePath(ast);

        var updatePath = path.get("program", "body", 0, "update");
        n.UpdateExpression.assert(updatePath.value);

        updatePath.replace(null);

        var printed = new Printer().print(ast);
        assert.strictEqual(printed.code, [
            "for (var i = 0; false; )",
            "  log(i);"
        ].join("\n"));
    });
});
