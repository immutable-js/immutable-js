var assert = require("assert");
var parse = require("../lib/parser").parse;
var Printer = require("../lib/printer").Printer;
var n = require("../lib/types").namedTypes;
var b = require("../lib/types").builders;

describe("ES6 Compatability", function() {
    it(
        "correctly converts from a shorthand method to ES5 function",
        function convertShorthandMethod() {
            var printer = new Printer({ tabWidth: 2 });
            var code = [
                "var name='test-name';",
                "var shorthandObj = {",
                "  name,",
                "  func() { return 'value'; }",
                "};"
            ].join("\n");
            var ast = parse(code);
            n.VariableDeclaration.assert(ast.program.body[1]);
            var shorthandObjDec = ast.program.body[1].declarations[0].init;
            var methodDecProperty = shorthandObjDec.properties[1];
            var newES5MethodProperty = b.property(
                methodDecProperty.kind,
                methodDecProperty.key,
                methodDecProperty.value,
                false,
                false
            );
            var correctMethodProperty = b.property(
                methodDecProperty.kind,
                methodDecProperty.key,
                b.functionExpression(
                    methodDecProperty.value.id,
                    methodDecProperty.value.params,
                    methodDecProperty.value.body,
                    methodDecProperty.value.generator,
                    methodDecProperty.value.expression
                ),
                false,
                false
            );
            assert.strictEqual(
                printer.print(newES5MethodProperty).code,
                printer.print(correctMethodProperty).code
            );
        }
    );
});
